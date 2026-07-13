import { NextResponse } from "next/server"

import snapshotJson from "@/data/paper-trading-snapshot.json"
import {
  revaluePaperTradingPosition,
  type PaperTradingResponse,
  type PaperTradingSnapshot,
} from "@/lib/paper-trading"

export const dynamic = "force-dynamic"

type BinanceMark = {
  markPrice: string
  time: number
}

const bundledSnapshot = snapshotJson as PaperTradingSnapshot
const liveStatusUrl =
  "https://api.github.com/gists/04e3d1b16716ecb82ae372cd16e8e70e"
const liveStatusFilename = "paper-trading-live.json"

type GitHubGistResponse = {
  files?: Record<string, { content?: string }>
}

async function loadStrategySnapshot() {
  try {
    const response = await fetch(liveStatusUrl, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        "User-Agent": "qiu.dev-paper-trading/1.0",
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })

    if (!response.ok) {
      throw new Error(`live status request failed: ${response.status}`)
    }

    const gist = (await response.json()) as GitHubGistResponse
    const content = gist.files?.[liveStatusFilename]?.content
    if (!content) throw new Error("live status file is missing")
    const liveSnapshot = JSON.parse(content) as PaperTradingSnapshot
    if (
      !Array.isArray(liveSnapshot.strategies) ||
      liveSnapshot.strategies.length !== 4 ||
      !Array.isArray(liveSnapshot.trades) ||
      !liveSnapshot.published_at_utc
    ) {
      throw new Error("live status payload is incomplete")
    }

    const ageMilliseconds =
      Date.now() - new Date(liveSnapshot.published_at_utc).getTime()
    return {
      snapshot: liveSnapshot,
      strategySource: "live_publisher" as const,
      strategySourceStale:
        !Number.isFinite(ageMilliseconds) || ageMilliseconds > 90_000,
      strategySourceError: "",
    }
  } catch (error) {
    return {
      snapshot: bundledSnapshot,
      strategySource: "published_snapshot" as const,
      strategySourceStale: true,
      strategySourceError:
        error instanceof Error ? error.message : "live status is unavailable",
    }
  }
}

async function fetchMarkPrice(symbol: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 4500)

  try {
    const response = await fetch(
      `https://www.binance.com/fapi/v1/premiumIndex?symbol=${encodeURIComponent(symbol)}`,
      {
        cache: "no-store",
        signal: controller.signal,
      },
    )

    if (!response.ok) {
      throw new Error(`Binance mark price request failed: ${response.status}`)
    }

    const data = (await response.json()) as BinanceMark
    const price = Number(data.markPrice)

    if (!Number.isFinite(price) || price <= 0) {
      throw new Error("Binance returned an invalid mark price")
    }

    return { price, time: data.time }
  } finally {
    clearTimeout(timeout)
  }
}

export async function GET() {
  const source = await loadStrategySnapshot()
  const snapshot = source.snapshot
  const symbols = Array.from(
    new Set(
      snapshot.strategies
        .map((strategy) => strategy.open_position?.symbol)
        .filter((symbol): symbol is string => Boolean(symbol)),
    ),
  )

  const marks = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        return { symbol, ...(await fetchMarkPrice(symbol)), live: true as const }
      } catch {
        const fallback = snapshot.strategies.find(
          (strategy) => strategy.open_position?.symbol === symbol,
        )?.open_position

        return {
          symbol,
          price: fallback?.mark_price ?? 0,
          time: new Date(snapshot.published_at_utc).getTime(),
          live: false as const,
        }
      }
    }),
  )

  const markMap = new Map(marks.map((mark) => [mark.symbol, mark]))
  const liveCount = marks.filter((mark) => mark.live).length
  const marketSource: PaperTradingResponse["market_source"] =
    liveCount === marks.length && marks.length > 0
      ? "binance_futures"
      : liveCount > 0
        ? "binance_with_snapshot_fallback"
        : source.strategySource === "live_publisher"
          ? "local_publisher"
          : "published_snapshot"
  const latestMarketTime = Math.max(
    ...marks.map((mark) => mark.time),
    new Date(snapshot.published_at_utc).getTime(),
  )

  const strategies = snapshot.strategies.map((strategy) => {
    if (!strategy.open_position) return strategy

    const mark = markMap.get(strategy.open_position.symbol)
    if (!mark || !mark.live) {
      return {
        ...strategy,
        open_position: {
          ...strategy.open_position,
          mark_price_stale:
            source.strategySource !== "live_publisher" ||
            source.strategySourceStale ||
            strategy.open_position.mark_price_stale,
        },
      }
    }

    return {
      ...strategy,
      open_position: revaluePaperTradingPosition(
        strategy.open_position,
        mark.price,
      ),
    }
  })

  const response: PaperTradingResponse = {
    ...snapshot,
    strategies,
    strategy_source: source.strategySource,
    strategy_source_stale: source.strategySourceStale,
    strategy_source_error: source.strategySourceError,
    market_source: marketSource,
    market_as_of_utc: new Date(latestMarketTime).toISOString(),
    refresh_mode: "manual",
  }

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  })
}
