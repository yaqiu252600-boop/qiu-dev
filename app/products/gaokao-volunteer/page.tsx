import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  Database,
  GraduationCap,
  LineChart,
  ShieldCheck,
} from "lucide-react"

import { GaokaoDisclaimer } from "@/components/gaokao/gaokao-disclaimer"
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
  title: "高考志愿数据查询与辅助分析工具 | qiu.dev",
  description:
    "基于官方公开数据的高考院校、投档线和数据来源查询工具。",
}

const productHighlights = [
  {
    title: "官方院校库",
    description:
      "院校搜索只读取教育部 2026 年全国普通高等学校名单，不生成不存在的学校。",
    icon: Database,
  },
  {
    title: "投档线参考",
    description:
      "当前正式推荐只来自已导入的官方投档线数据；没有最低位次时只做分数参考。",
    icon: LineChart,
  },
  {
    title: "边界清晰",
    description:
      "逐分段、招生计划或专业录取线未验证时，页面会明确显示不可用于推荐。",
    icon: ShieldCheck,
  },
]

const dataSourceItems = [
  {
    label: "全国官方来源",
    value: "教育部全国普通高等学校名单、阳光高考院校库、阳光高考专业知识库。",
  },
  {
    label: "省级来源",
    value:
      "各省教育考试院、招生考试院、招生考试信息网发布的官方公告、PDF、Excel。",
  },
  {
    label: "当前可用",
    value:
      "教育部 2026 高校名单、江苏 2025 普通类本科批投档最低分；非江苏省份已开始官方源发现和状态登记。",
  },
  {
    label: "当前不可用",
    value:
      "未导入 verified 一分一段、含最低位次投档线或当年招生计划的省份，只展示不可用原因，不生成具体学校专业方案。",
  },
]

const targetSegmentReasons = [
  "这个分段考生更需要具体路径，而不是空泛推荐学校名称。",
  "本科、专科、民办本科、职业本科之间的选择复杂，不能只看分数线。",
  "专业和就业方向对未来影响更大，尤其要重视学费、城市和升学衔接。",
  "没有 verified 位次和招生计划时，系统只提供历史投档最低分参考。",
]

const dataAccessPlan = [
  "江苏由独立任务继续处理，本轮全国扩展不覆盖江苏数据。",
  "先跑第一批非江苏省份官方源发现和 missing/blocked/partial 状态登记。",
  "只在找到公开可批量下载并可校验的官方文件后，才导入 processed 数据。",
  "逐省登记 source_name、source_url、source_updated_at、downloaded_at 和处理路径。",
]

export default function GaokaoVolunteerProductPage() {
  return (
    <div>
      <section className="border-b border-border bg-white py-10">
        <div className="container grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="dev">开发中</Badge>
              <Badge variant="outline" className="bg-white">
                官方数据
              </Badge>
              <Badge variant="outline" className="bg-white">
                全国状态版
              </Badge>
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              高考志愿数据查询与辅助分析工具
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              一个面向高考志愿填报场景的数据工具。当前版本优先解决数据可信问题：
              院校库来自教育部官方名单，省份数据按官方来源逐步登记；
              缺失数据只显示状态和原因，不会编造。
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/tools/gaokao-volunteer">
                  体验工具
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/data-sources">查看数据来源</Link>
              </Button>
            </div>
          </div>
          <GaokaoDisclaimer />
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <SectionHeading
            title="产品能力"
            description="先把可信数据底座做稳，再逐步扩展省份、批次和年份。"
          />
          <div className="grid gap-5 lg:grid-cols-3">
            {productHighlights.map((item) => (
              <Card key={item.title} className="bg-white">
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-white py-12">
        <div className="container mb-10">
          <SectionHeading
            title="数据来源说明"
            description="所有真实数据接入都需要记录来源、年份、省份和更新时间。"
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {dataSourceItems.map((item) => (
              <Card key={item.label} className="shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">{item.label}</CardTitle>
                  <CardDescription>{item.value}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <div className="container mb-10 grid gap-6 lg:grid-cols-2">
          <Card className="bg-white">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <GraduationCap className="h-5 w-5" aria-hidden="true" />
              </div>
              <CardTitle>为什么重点服务 300-550 分？</CardTitle>
              <CardDescription>
                普通分数段的核心问题通常不是缺少学校名称，而是不知道怎样取舍。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                {targetSegmentReasons.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <Database className="h-5 w-5" aria-hidden="true" />
              </div>
              <CardTitle>数据接入计划</CardTitle>
              <CardDescription>
                逐省接入可追溯数据，先保证来源和结构可靠，再扩大覆盖范围。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                {dataAccessPlan.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
