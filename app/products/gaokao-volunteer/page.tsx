import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  Database,
  GraduationCap,
  Layers,
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
  title: "高考志愿辅助系统 | qiu.dev",
  description:
    "根据省份、分数、科类和兴趣方向生成初步冲稳保志愿推荐方案。",
}

const productHighlights = [
  {
    title: "冲稳保结构",
    description: "把推荐结果拆成冲刺、稳妥、保底三类，降低选择时的信息混乱。",
    icon: Layers,
  },
  {
    title: "规则可解释",
    description: "每个推荐项都展示匹配理由、风险提示、适合人群和建议操作。",
    icon: LineChart,
  },
  {
    title: "安全边界清晰",
    description: "当前版本明确标注 Beta 演示属性，不替代真实志愿填报判断。",
    icon: ShieldCheck,
  },
]

const roadmap = [
  "接入真实招生计划、专业组和历年录取位次数据。",
  "增加省份、批次、选科要求和城市偏好的细分筛选。",
  "把规则推荐升级为规则 + AI 解释的组合方案。",
]

const dataSourceItems = [
  {
    label: "全国官方来源",
    value: "阳光高考院校库、阳光高考专业知识库、阳光志愿信息服务系统。",
  },
  {
    label: "省级来源",
    value: "各省教育考试院、招生考试院、招生考试信息网发布的官方公告、PDF、Excel。",
  },
  {
    label: "数据类型",
    value: "院校库、专业库、历年录取分数、最低位次、一分一段、招生计划、招生章程。",
  },
  {
    label: "当前状态",
    value: "真实数据接入中；未接入地区会明确标记演示数据，不作为真实填报依据。",
  },
]

const targetSegmentReasons = [
  "这个分段的考生更需要具体路径，而不是空泛地推荐学校名称。",
  "本科、专科、民办本科、职业本科之间的选择复杂，不能只看分数线。",
  "专业和就业方向对未来影响更大，尤其要重视可迁移技能和升学衔接。",
  "学费、城市、专升本机会、校区和选科要求需要放在一起比较。",
  "系统会优先解决普通分数段考生真实会遇到的取舍问题。",
]

const dataAccessPlan = [
  "2019-2025 历年录取数据",
  "一分一段表",
  "招生计划",
  "院校库",
  "专业库",
  "招生章程",
  "逐省接入与来源登记",
  "所有数据必须保留 sourceName、sourceUrl、year、province、fetchedAt / updatedAt",
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
                AI / 教育
              </Badge>
              <Badge variant="outline" className="bg-white">
                MVP
              </Badge>
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              高考志愿辅助系统
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              一个面向高考志愿填报场景的产品实验。当前版本先用规则和可标记的演示 fallback 数据跑通
              输入、推荐、解释和风险提示流程，为后续接入官方真实数据和 AI 解释层打基础。
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/tools/gaokao-volunteer">
                  体验工具
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/projects/gaokao-volunteer">查看技术项目</Link>
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
            description="先把核心体验做小做稳，后续再扩展数据和智能解释能力。"
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
        <div className="container grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              迭代方向
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              这个产品会从演示版逐步走向可验证的填报辅助工具，重点是数据可靠性、
              推荐可解释性和风险边界。
            </p>
          </div>
          <Card className="bg-white">
            <CardContent className="p-6">
              <ul className="space-y-4 text-sm leading-6 text-muted-foreground">
                {roadmap.map((item) => (
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
