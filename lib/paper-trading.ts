export type PaperTradingPosition = {
  symbol: string
  side: "long" | "short"
  entry_time_utc: string
  entry_price: number
  avg_entry_price: number
  stop_price: number
  initial_stop: number
  liquidation_price: number
  best_price: number
  leverage: number
  base_position_margin_usdt: number
  max_margin_used_multiple: number
  add_count: number
  roll_armed: boolean
  trailing_armed: boolean
  mark_price: number
  mark_price_stale: boolean
  unrealized_pnl_usdt: number
  unrealized_margin_return_pct: number
}

export type PaperTradingStrategy = {
  strategy_id: string
  strategy_name: string
  as_of_utc: string
  monitor_pid: number
  paper_only: boolean
  initial_capital_usdt: number
  target_capital_usdt: number
  reserved_profit_usdt: number
  total_injected_usdt: number
  peak_external_cash_needed_usdt: number
  trading_capital_cap_usdt: number
  trade_count: number
  win_count: number
  loss_count: number
  current_day: string
  daily_entry_count: number
  last_error: string
  last_error_utc: string
  last_selected_symbol: string
  last_selected_rank: number
  day_mode: string
  position_fraction: number
  open_position: PaperTradingPosition | null
}

export type PaperTradingTrade = {
  trade_no: number
  day: string
  symbol: string
  side: "long" | "short"
  entry_time_utc: string
  exit_time_utc: string
  entry_price: number
  exit_price: number
  exit_reason: string
  add_count: number
  margin_return_pct: number
  pnl_usdt: number
  starting_target_capital_usdt: number
  ending_target_capital_usdt: number
  strategy_name: string
}

export type PaperTradingSnapshot = {
  published_at_utc: string
  paper_only: boolean
  strategies: PaperTradingStrategy[]
  trades: PaperTradingTrade[]
}

export type PaperTradingResponse = PaperTradingSnapshot & {
  strategy_source: "published_snapshot"
  market_source:
    | "binance_futures"
    | "binance_with_snapshot_fallback"
    | "published_snapshot"
  market_as_of_utc: string
  refresh_mode: "manual"
}
