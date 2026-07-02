import type { Metadata } from "next"

import { CultureDisclaimer } from "@/components/culture-disclaimer"
import { CultureToolLinks } from "@/components/culture-tool-links"
import { NameRecommendationWorkbench } from "@/components/name-recommendation-workbench"
import { SectionHeading } from "@/components/section-heading"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "取名推荐 - 宝宝取名与名字寓意参考",
  description:
    "免费取名推荐工具，根据姓氏、风格偏好与传统五行文化生成名字灵感，仅供文化参考。",
}

export default function NamePage() {
  return (
    <section className="page-section">
      <div className="container space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <SectionHeading
            title="取名推荐"
            description="根据姓氏、风格偏好、避开用字和传统五行文化生成名字灵感与寓意参考。"
          />
          <Badge variant="outline" className="bg-white">
            不保存输入
          </Badge>
        </div>
        <CultureToolLinks />
        <NameRecommendationWorkbench />
        <CultureDisclaimer />
      </div>
    </section>
  )
}
