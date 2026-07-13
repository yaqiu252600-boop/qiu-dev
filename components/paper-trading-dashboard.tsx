"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  revaluePaperTradingPosition,
  type PaperTradingPosition,
  type PaperTradingResponse,
  type PaperTradingStrategy,
} from "@/lib/paper-trading"

type BinanceMark = {
  symbol: string
  markPrice: string
  time: number
}

const numberFormatter = new Intl.NumberFormat("zh-CN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const priceFormatter = new Intl.NumberFormat("zh-CN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 8,
})

function formatUsdt(value: number) {
  return `${value >= 0 ? "+" : "-"}$${numberFormatter.format(Math.abs(value))}`
}

function formatUnsignedUsdt(value: number) {
  return `$${numberFormatter.format(value)}`
}

function formatPercent(value: number) {
  return `${value >= 0 ? "+" : "-"}${numberFormatter.format(Math.abs(value) * 100)}%`
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(value))
}

function pnlClass(value: number) {
  if (value > 0) return "text-emerald-700"
  if (value < 0) return "text-rose-700"
  return "text-foreground"
}

function positionResult(position: PaperTradingPosition | null) {
  return position?.unrealized_pnl_usdt ?? 0
}

function totalNetResult(strategy: PaperTradingStrategy) {
  return (
    strategy.target_capital_usdt +
    strategy.reserved_profit_usdt +
    positionResult(strategy.open_position) -
    strategy.initial_capital_usdt -
    strategy.total_injected_usdt
  )
}

function marketSourceLabel(source: PaperTradingResponse["market_source"]) {
  if (source === "binance_futures") return "币安合约最新标记价"
  if (source === "binance_with_snapshot_fallback") return "币安标记价（部分使用快照）"
  return "已发布快照标记价"
}

function exitReasonLabel(reason: string) {
  const labels: Record<string, string> = {
    stop: "止损",
    trail_stop: "移动止盈",
    take_profit: "固定止盈",
  }
  return labels[reason] ?? reason
}

async function fetchBrowserMarkPrice(symbol: string) {
  const response = await fetch(
    `https://www.binance.com/fapi/v1/premiumIndex?symbol=${encodeURIComponent(symbol)}`,
    { cache: "no-store" },
  )

  if (!response.ok) throw new Error(`标记价请求失败：${response.status}`)

  const data = (await response.json()) as BinanceMark
  const price = Number(data.markPrice)

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("标记价数据无效")
  }

  return { symbol, price, time: data.time }
}

async function refreshStaleMarkPrices(data: PaperTradingResponse) {
  const staleSymbols = Array.from(
    new Set(
      data.strategies
        .map((strategy) => strategy.open_position)
        .filter(
          (position): position is PaperTradingPosition =>
            Boolean(position?.mark_price_stale),
        )
        .map((position) => position.symbol),
    ),
  )

  if (staleSymbols.length === 0) return data

  const results = await Promise.allSettled(
    staleSymbols.map((symbol) => fetchBrowserMarkPrice(symbol)),
  )
  const liveMarks = results
    .filter(
      (result): result is PromiseFulfilledResult<{
        symbol: string
        price: number
        time: number
      }> => result.status === "fulfilled",
    )
    .map((result) => result.value)

  if (liveMarks.length === 0) return data

  const markMap = new Map(liveMarks.map((mark) => [mark.symbol, mark]))
  const strategies = data.strategies.map((strategy) => {
    const position = strategy.open_position
    if (!position) return strategy

    const mark = markMap.get(position.symbol)
    if (!mark) return strategy

    return {
      ...strategy,
      open_position: revaluePaperTradingPosition(position, mark.price),
    }
  })

  return {
    ...data,
    strategies,
    market_source:
      liveMarks.length === staleSymbols.length
        ? ("binance_futures" as const)
        : ("binance_with_snapshot_fallback" as const),
    market_as_of_utc: new Date(
      Math.max(...liveMarks.map((mark) => mark.time)),
    ).toISOString(),
  }
}

export function PaperTradingDashboard() {
  const [data, setData] = useState<PaperTradingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadStatus = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/paper-trading", { cache: "no-store" })
      if (!response.ok) throw new Error(`请求失败：${response.status}`)
      const payload = (await response.json()) as PaperTradingResponse
      setData(await refreshStaleMarkPrices(payload))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "数据加载失败")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStatus()
  }, [loadStatus])

  const overview = useMemo(() => {
    if (!data) return null
    const openStrategies = data.strategies.filter((strategy) => strategy.open_position)
    const floatingPnl = openStrategies.reduce(
      (sum, strategy) => sum + positionResult(strategy.open_position),
      0,
    )
    const profitable = openStrategies.filter(
      (strategy) => positionResult(strategy.open_position) > 0,
    ).length

    return {
      openCount: openStrategies.length,
      floatingPnl,
      profitable,
      losing: openStrategies.filter(
        (strategy) => positionResult(strategy.open_position) < 0,
      ).length,
    }
  }, [data])

  if (!data && loading) {
    return (
      <Card className="bg-white">
        <CardContent className="flex min-h-56 items-center justify-center gap-3 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
          正在读取纸面策略状态
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="border-rose-200 bg-rose-50">
        <CardContent className="flex min-h-48 flex-col items-center justify-center gap-4 text-center">
          <AlertCircle className="h-6 w-6 text-rose-700" aria-hidden="true" />
          <p className="text-sm text-rose-800">{error || "暂时无法读取策略数据"}</p>
          <Button type="button" variant="outline" onClick={loadStatus}>
            重新加载
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="live">纸面模拟</Badge>
                <Badge variant="outline">不自动刷新</Badge>
                <Badge variant="outline">4 个策略</Badge>
              </div>
              <CardTitle className="mt-4 text-xl">策略总体状态</CardTitle>
              <CardDescription className="mt-2 max-w-3xl">
                策略持仓与累计结果来自最近一次发布快照；打开页面或点击刷新时，会重新读取币安合约标记价并计算当前浮盈浮亏。
              </CardDescription>
            </div>
            <Button type="button" onClick={loadStatus} disabled={loading}>
              <RefreshCw
                className={loading ? "animate-spin" : undefined}
                aria-hidden="true"
              />
              {loading ? "刷新中" : "刷新数据"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {error ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              本次刷新失败，仍显示上一次成功数据：{error}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <OverviewBlock
              label="当前持仓策略"
              value={`${overview?.openCount ?? 0} / ${data.strategies.length}`}
              note="其余策略为空仓"
              icon={WalletCards}
            />
            <OverviewBlock
              label="合计浮盈浮亏"
              value={formatUsdt(overview?.floatingPnl ?? 0)}
              note={`${overview?.profitable ?? 0} 个浮盈 · ${overview?.losing ?? 0} 个浮亏`}
              icon={(overview?.floatingPnl ?? 0) >= 0 ? TrendingUp : TrendingDown}
              valueClass={pnlClass(overview?.floatingPnl ?? 0)}
            />
            <OverviewBlock
              label="策略状态时间"
              value={formatTime(data.published_at_utc)}
              note="已发布快照"
              icon={Clock3}
              compact
            />
            <OverviewBlock
              label="标记价时间"
              value={formatTime(data.market_as_of_utc)}
              note={marketSourceLabel(data.market_source)}
              icon={ShieldCheck}
              compact
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        {data.strategies.map((strategy) => (
          <StrategyCard key={strategy.strategy_id} strategy={strategy} />
        ))}
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg">最近已平仓记录</CardTitle>
          <CardDescription>
            成交记录随策略快照发布，不会被标记价刷新改写。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="border-b border-border text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-3 font-medium">策略</th>
                  <th className="px-3 py-3 font-medium">交易对</th>
                  <th className="px-3 py-3 font-medium">方向</th>
                  <th className="px-3 py-3 font-medium">离场原因</th>
                  <th className="px-3 py-3 font-medium">滚仓次数</th>
                  <th className="px-3 py-3 font-medium">收益率</th>
                  <th className="px-3 py-3 font-medium">盈亏</th>
                  <th className="px-3 py-3 font-medium">离场时间</th>
                </tr>
              </thead>
              <tbody>
                {data.trades.map((trade) => (
                  <tr key={`${trade.strategy_name}-${trade.trade_no}-${trade.exit_time_utc}`} className="border-b border-border/70 last:border-0">
                    <td className="px-3 py-3 font-medium">{trade.strategy_name}</td>
                    <td className="px-3 py-3">{trade.symbol}</td>
                    <td className="px-3 py-3">{trade.side === "long" ? "做多" : "做空"}</td>
                    <td className="px-3 py-3">{exitReasonLabel(trade.exit_reason)}</td>
                    <td className="px-3 py-3">{trade.add_count}</td>
                    <td className={`px-3 py-3 font-medium ${pnlClass(trade.margin_return_pct)}`}>
                      {formatPercent(trade.margin_return_pct)}
                    </td>
                    <td className={`px-3 py-3 font-medium ${pnlClass(trade.pnl_usdt)}`}>
                      {formatUsdt(trade.pnl_usdt)}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {formatTime(trade.exit_time_utc)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border border-border bg-white p-4 text-sm leading-6 text-muted-foreground">
        <p>
          “累计净结果”按当前资金 + 预留利润 + 浮盈浮亏 - 初始资金 - 累计补资计算；因此补资不会被误算成策略盈利。进程 PID 只代表快照采集时监控程序已启动，不代表浏览此页面时仍在线。
        </p>
      </div>
    </div>
  )
}

function StrategyCard({ strategy }: { strategy: PaperTradingStrategy }) {
  const position = strategy.open_position
  const floatingPnl = positionResult(position)
  const currentEquity =
    strategy.target_capital_usdt + strategy.reserved_profit_usdt + floatingPnl
  const netResult = totalNetResult(strategy)
  const winRate =
    strategy.trade_count > 0 ? strategy.win_count / strategy.trade_count : 0

  return (
    <Card className="overflow-hidden bg-white">
      <CardHeader className="border-b border-border bg-slate-50/70">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{strategy.strategy_name}</CardTitle>
            <CardDescription className="mt-2">
              仓位比例 {numberFormatter.format(strategy.position_fraction * 100)}% · 当日入场 {strategy.daily_entry_count} 次
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={position ? "live" : "planned"}>
              {position ? "当前持仓" : "当前空仓"}
            </Badge>
            <Badge variant="outline">纸面</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-6">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            策略总情况
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
            <Metric label="当前估算权益" value={formatUnsignedUsdt(currentEquity)} />
            <Metric
              label="累计净结果"
              value={formatUsdt(netResult)}
              valueClass={pnlClass(netResult)}
            />
            <Metric
              label="成交 / 胜率"
              value={`${strategy.trade_count} / ${numberFormatter.format(winRate * 100)}%`}
            />
            <Metric
              label="累计补资"
              value={formatUnsignedUsdt(strategy.total_injected_usdt)}
            />
          </div>
        </div>

        {position ? (
          <div className="rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">{position.symbol}</p>
                  <Badge variant="outline">
                    {position.side === "long" ? "做多" : "做空"} · {numberFormatter.format(position.leverage)}x
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  入场 {formatTime(position.entry_time_utc)}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-xl font-semibold ${pnlClass(floatingPnl)}`}>
                  {formatUsdt(floatingPnl)}
                </p>
                <p className={`mt-1 text-xs ${pnlClass(position.unrealized_margin_return_pct)}`}>
                  保证金回报 {formatPercent(position.unrealized_margin_return_pct)}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
              <Metric label="平均入场价" value={priceFormatter.format(position.avg_entry_price)} />
              <Metric
                label={position.mark_price_stale ? "快照标记价" : "最新标记价"}
                value={priceFormatter.format(position.mark_price)}
              />
              <Metric label="当前止损价" value={priceFormatter.format(position.stop_price)} />
              <Metric label="预估强平价" value={priceFormatter.format(position.liquidation_price)} />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <StatePill
                label="滚仓"
                active={position.roll_armed}
                detail={`已加仓 ${position.add_count} 次`}
              />
              <StatePill
                label="移动止盈"
                active={position.trailing_armed}
                detail={position.trailing_armed ? "保护已启动" : "尚未触发"}
              />
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-slate-50 p-6 text-center">
            <p className="font-medium">当前没有持仓</p>
            <p className="mt-2 text-sm text-muted-foreground">
              浮盈浮亏、滚仓和移动止盈当前均不适用。
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
          <span>快照采集时进程 PID：{strategy.monitor_pid}</span>
          <span className={strategy.last_error ? "text-rose-700" : "text-emerald-700"}>
            {strategy.last_error ? `最近错误：${strategy.last_error}` : "未记录错误"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function OverviewBlock({
  label,
  value,
  note,
  icon: Icon,
  valueClass = "text-foreground",
  compact = false,
}: {
  label: string
  value: string
  note: string
  icon: typeof WalletCards
  valueClass?: string
  compact?: boolean
}) {
  return (
    <div className="rounded-lg border border-border bg-slate-50/60 p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden="true" />
        {label}
      </div>
      <p className={`mt-3 font-semibold ${compact ? "text-sm" : "text-xl"} ${valueClass}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  )
}

function Metric({
  label,
  value,
  valueClass = "text-foreground",
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 font-semibold ${valueClass}`}>{value}</p>
    </div>
  )
}

function StatePill({
  label,
  active,
  detail,
}: {
  label: string
  active: boolean
  detail: string
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-md border p-3 ${
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-slate-200 bg-slate-50 text-slate-700"
      }`}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        {active ? (
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Clock3 className="h-4 w-4" aria-hidden="true" />
        )}
        {label}：{active ? "已启动" : "未启动"}
      </div>
      <span className="text-xs">{detail}</span>
    </div>
  )
}
