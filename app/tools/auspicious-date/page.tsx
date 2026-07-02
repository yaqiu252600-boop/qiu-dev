import type { Metadata } from "next"

import { AuspiciousDateWorkbench } from "@/components/auspicious-date-workbench"
import { CultureDisclaimer } from "@/components/culture-disclaimer"
import { CultureToolLinks } from "@/components/culture-tool-links"
import { SectionHeading } from "@/components/section-heading"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "良辰吉日查询 - 结婚搬家开业黄道吉日参考",
  description:
    "良辰吉日查询工具，按结婚、搬家、开业、领证等事项筛选传统黄历参考日期，仅供娱乐参考。",
}

export default function AuspiciousDatePage() {
  return (
    <section className="page-section">
      <div className="container space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <SectionHeading
            title="良辰吉日"
            description="按事项和日期范围查询传统黄历参考日期，不用于医疗、法律、投资等重大决策。"
          />
          <Badge variant="outline" className="bg-white">
            民俗参考
          </Badge>
        </div>
        <CultureToolLinks />
        <AuspiciousDateWorkbench />
        <CultureDisclaimer />
      </div>
    </section>
  )
}
