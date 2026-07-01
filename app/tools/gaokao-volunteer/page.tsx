import type { Metadata } from "next"
import Link from "next/link"

import { TrustedGaokaoWorkbench } from "@/components/gaokao/trusted-gaokao-workbench"
import { SectionHeading } from "@/components/section-heading"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "高考志愿数据查询与辅助分析工具 | qiu.dev",
  description:
    "基于官方公开数据的高考志愿数据查询、分数换位次和投档线辅助分析工具。",
}

export default function GaokaoVolunteerToolPage() {
  return (
    <section className="page-section">
      <div className="container">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <SectionHeading
            title="高考志愿数据查询与辅助分析工具"
            description="只使用官方或可信来源数据。没有导入的数据会显示暂无可信数据，不会由系统编造。"
          />
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-white">
              官方数据
            </Badge>
            <Badge variant="outline" className="bg-white">
              江苏 MVP
            </Badge>
            <Button asChild variant="outline" size="sm">
              <Link href="/data-sources">查看数据来源</Link>
            </Button>
          </div>
        </div>
        <TrustedGaokaoWorkbench />
      </div>
    </section>
  )
}
