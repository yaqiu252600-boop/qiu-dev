import { NextResponse } from "next/server"

import snapshotJson from "@/data/paper-trading-snapshot.json"
import type {
  PaperTradingPosition,
  PaperTradingResponse,
  PaperTradingSnapshot,
} from "@/lib/paper-trading"

export const dynamic = "force-dynamic"

type BinanceMark = {
  markPrice: string
  time: number
}

const snapshot = snapshotJson as PaperTradingSnapshot

async function fetchMarkPrice(symbol: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 4500)

  try {
    const response = await fetch(
      `https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${encodeURIComponent(symbol)}`,
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

function withMarkPrice(position: PaperTradingPosition, markPrice: number) {
  const usedMargin =
    position.base_position_margin_usdt * position.max_margin_used_multiple
  const direction = position.side === "long" ? 1 : -1
  const priceMove =
    direction * ((markPrice - position.avg_entry_price) / position.avg_entry_price)
  const unrealizedPnl = usedMargin * position.leverage * priceMove

  return {
    ...position,
    mark_price: markPrice,
    mark_price_stale: false,
    unrealized_pnl_usdt: unrealizedPnl,
    unrealized_margin_return_pct:
      usedMargin > 0 ? unrealizedPnl / usedMargin : 0,
  }
}

export async function GET() {
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
          mark_price_stale: true,
        },
      }
    }

    return {
      ...strategy,
      open_position: withMarkPrice(strategy.open_position, mark.price),
    }
  })

  const response: PaperTradingResponse = {
    ...snapshot,
    strategies,
    strategy_source: "published_snapshot",
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
