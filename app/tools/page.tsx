import Link from "next/link"
import { ArrowRight, Wrench } from "lucide-react"

import { SectionHeading } from "@/components/section-heading"
import { StatusBadge } from "@/components/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getToolProjects } from "@/lib/projects"

export default function ToolsPage() {
  const tools = getToolProjects()

  return (
    <section className="page-section">
      <div className="container">
        <SectionHeading
          title="工具"
          description="这里展示已经接入 qiu.dev 的可用工具，后续新增工具会从项目数据自动读取。"
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool) => (
            <Card key={tool.slug} className="flex h-full flex-col bg-white">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <Wrench className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <StatusBadge status={tool.status} />
                    <Badge variant="outline" className="bg-white">
                      {tool.type}
                    </Badge>
                  </div>
                </div>
                <CardTitle>{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button asChild>
                  <Link href={tool.demoUrl ?? `/projects/${tool.slug}`}>
                    打开工具
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
