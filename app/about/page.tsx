import Link from "next/link"
import { Github, Mail } from "lucide-react"

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
import { getProjectStats } from "@/lib/projects"

const focusAreas = ["Web 工具", "AI 应用", "教育产品", "开发者工具", "自动化", "产品实验"]

export default function AboutPage() {
  const stats = getProjectStats()

  return (
    <section className="page-section">
      <div className="container">
        <SectionHeading
          title="我的构建方向"
          description="这里更关注正在构建什么，而不是传统意义上的个人介绍。"
        />
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>持续构建有价值的 Web 产品</CardTitle>
            <CardDescription className="max-w-3xl text-base leading-7">
              qiu.dev 会长期记录 Web 工具、AI 应用和产品实验的构建过程。新的项目会持续接入，旧项目也会根据真实使用反馈迭代。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-sm font-medium">目前关注</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {focusAreas.map((item) => (
                  <Badge key={item} variant="outline" className="bg-white">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map((metric) => (
                <div key={metric.label} className="rounded-md border bg-background p-4">
                  <div className="text-2xl font-semibold text-primary">
                    {metric.value}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="outline">
                <Link href="https://github.com/" target="_blank">
                  <Github aria-hidden="true" />
                  GitHub
                </Link>
              </Button>
              <Button asChild>
                <Link href="/contact">
                  <Mail aria-hidden="true" />
                  联系我
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
