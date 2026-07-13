import type { Metadata } from "next"

import { PaperTradingDashboard } from "@/components/paper-trading-dashboard"
import { SectionHeading } from "@/components/section-heading"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "纸面策略看板",
  description:
    "查看五个纸面模拟策略的累计结果、当前持仓浮盈浮亏、滚仓、移动止盈和最近平仓记录。",
}

export default function PaperTradingPage() {
  return (
    <section className="page-section">
      <div className="container space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <SectionHeading
            title="纸面策略看板"
            description="集中查看五个纸面模拟策略的总资金情况、当前持仓、浮盈浮亏、滚仓与移动止盈状态。"
          />
          <Badge variant="outline" className="bg-white">
            仅供策略观察
          </Badge>
        </div>
        <PaperTradingDashboard />
      </div>
    </section>
  )
}
