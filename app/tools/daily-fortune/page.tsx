import type { Metadata } from "next"

import { CultureDisclaimer } from "@/components/culture-disclaimer"
import { CultureToolLinks } from "@/components/culture-tool-links"
import { DailyFortuneWorkbench } from "@/components/daily-fortune-workbench"
import { SectionHeading } from "@/components/section-heading"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "每日一签 - 今日运势与传统文化抽签",
  description:
    "每日一签工具，生成今日签文、今日关键词、宜忌提醒与传统文化娱乐解读，仅供参考。",
}

export default function DailyFortunePage() {
  return (
    <section className="page-section">
      <div className="container space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <SectionHeading
            title="每日一签"
            description="基于日期种子生成今日签文、关键词、宜忌与生活提醒，定位为传统文化娱乐参考。"
          />
          <Badge variant="outline" className="bg-white">
            今日稳定
          </Badge>
        </div>
        <CultureToolLinks />
        <DailyFortuneWorkbench />
        <CultureDisclaimer />
      </div>
    </section>
  )
}
