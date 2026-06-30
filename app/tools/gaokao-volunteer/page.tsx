import type { Metadata } from "next"
import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowRight, BookOpenCheck, ClipboardList, ShieldCheck } from "lucide-react"

import { GaokaoDisclaimer } from "@/components/gaokao/gaokao-disclaimer"
import { GaokaoForm } from "@/components/gaokao/gaokao-form"
import { SectionHeading } from "@/components/section-heading"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "高考志愿辅助系统 | qiu.dev",
  description:
    "根据省份、分数、科类和兴趣方向生成初步冲稳保志愿推荐方案。",
}

const guideItems = [
  "先输入省份、分数、科类和兴趣方向，生成一版初步结果。",
  "重点查看每个院校的匹配理由、风险提示和建议操作。",
  "把结果作为思路整理，再结合官方招生计划和位次数据二次核对。",
]

const riskItems = [
  "当前系统正在接入真实招生数据，已接入数据会标注来源；未接入地区可能使用演示数据。",
  "志愿填报属于重大决策，请务必结合省教育考试院、阳光高考、高校招生章程等官方信息核验。",
  "专业组、选科要求、招生计划变化会显著影响最终结果。",
]

const nextSteps = [
  "接入真实院校、专业组和历年录取位次数据。",
  "增加省份差异化规则和批次筛选能力。",
  "引入 AI 解释层，生成更自然的志愿方案说明。",
]

export default function GaokaoVolunteerToolPage() {
  return (
    <div>
      <section className="border-b border-border bg-white py-10">
        <div className="container grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="dev">Beta</Badge>
              <Badge variant="outline" className="bg-white">
                高考志愿
              </Badge>
              <Badge variant="outline" className="bg-white">
                规则推荐
              </Badge>
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              高考志愿辅助系统
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              根据省份、分数、科类、兴趣方向和志愿偏好，生成初步的冲稳保志愿推荐方案，
              帮助考生更快整理院校选择思路。
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <a href="#gaokao-form">
                  开始生成
                  <ArrowRight aria-hidden="true" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/projects/gaokao-volunteer">查看项目详情</Link>
              </Button>
            </div>
          </div>
          <GaokaoDisclaimer />
        </div>
      </section>

      <section id="gaokao-form" className="page-section">
        <div className="container">
          <SectionHeading
            title="输入信息并生成方案"
            description="当前系统正在接入真实招生数据。已接入数据会标注来源；未接入地区可能使用演示数据。志愿填报属于重大决策，请务必结合省教育考试院、阳光高考、高校招生章程等官方信息核验。"
          />
          <GaokaoForm />
        </div>
      </section>

      <section className="border-t border-border bg-white py-12">
        <div className="container grid gap-5 lg:grid-cols-3">
          <InfoCard
            icon={<ClipboardList className="h-5 w-5" aria-hidden="true" />}
            title="使用说明"
            items={guideItems}
          />
          <InfoCard
            icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
            title="风险提示"
            items={riskItems}
          />
          <InfoCard
            icon={<BookOpenCheck className="h-5 w-5" aria-hidden="true" />}
            title="下一步迭代"
            items={nextSteps}
          />
        </div>
      </section>
    </div>
  )
}

function InfoCard({
  icon,
  title,
  items,
}: {
  icon: ReactNode
  title: string
  items: string[]
}) {
  return (
    <Card className="h-full bg-white">
      <CardHeader>
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>围绕产品体验和真实填报风险保持清晰边界。</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
