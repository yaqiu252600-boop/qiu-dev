import Link from "next/link"
import { CalendarDays, Compass, ScrollText, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const tools = [
  {
    title: "每日一签",
    description: "生成今日签文、关键词、宜忌与生活提醒。",
    href: "/tools/daily-fortune",
    icon: ScrollText,
    status: "可用",
  },
  {
    title: "八字排盘",
    description: "输入出生日期时间，生成四柱、五行与基础文化解读。",
    href: "/tools/bazi",
    icon: Compass,
    status: "可用",
  },
  {
    title: "取名推荐",
    description: "按姓氏、风格和文字寓意生成名字灵感。",
    href: "/tools/name",
    icon: Sparkles,
    status: "可用",
  },
  {
    title: "良辰吉日",
    description: "按事项和日期范围筛选黄历参考日期。",
    href: "/tools/auspicious-date",
    icon: CalendarDays,
    status: "可用",
  },
]

export function TraditionalToolsSection() {
  return (
    <section className="border-y border-border bg-white py-8 sm:py-10">
      <div className="container">
        <div className="mb-4 max-w-2xl">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            传统文化工具
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            围绕传统历法、文字寓意与民俗文化做轻量参考，适合娱乐体验和灵感启发。
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {tools.map((tool) => {
            const Icon = tool.icon
            const content = (
              <Card className="h-full bg-white transition-colors hover:border-primary/40">
                <CardHeader className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <Badge variant={tool.status === "可用" ? "secondary" : "outline"}>
                      {tool.status}
                    </Badge>
                  </div>
                  <CardTitle>{tool.title}</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 text-sm leading-6 text-muted-foreground">
                  {tool.description}
                </CardContent>
              </Card>
            )

            return tool.href ? (
              <Link key={tool.title} href={tool.href} className="block h-full">
                {content}
              </Link>
            ) : (
              <div key={tool.title} className="h-full">
                {content}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
