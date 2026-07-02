import type { Metadata } from "next"

import { BaziWorkbench } from "@/components/bazi-workbench"
import { CultureDisclaimer } from "@/components/culture-disclaimer"
import { CultureToolLinks } from "@/components/culture-tool-links"
import { SectionHeading } from "@/components/section-heading"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "八字排盘工具 - 免费四柱八字与五行查询",
  description:
    "免费八字排盘工具，输入出生日期时间，生成四柱八字、五行分布、十神关系与传统命理文化解读，仅供娱乐参考。",
}

export default function BaziPage() {
  return (
    <section className="page-section">
      <div className="container space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <SectionHeading
            title="八字排盘工具"
            description="输入出生日期时间，生成四柱八字、五行分布、十神关系与传统命理文化解读。"
          />
          <Badge variant="outline" className="bg-white">
            默认不保存出生信息
          </Badge>
        </div>
        <CultureToolLinks />
        <BaziWorkbench />
        <CultureDisclaimer />
      </div>
    </section>
  )
}
