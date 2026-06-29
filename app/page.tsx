import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  Github,
  Mail,
  Rocket,
  Square,
  Wrench,
} from "lucide-react"

import { ProjectCard } from "@/components/project-card"
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
import {
  getBuildingProjects,
  getFeaturedProject,
  getProjectStats,
  getRecentProjects,
} from "@/lib/projects"
import { formatUpdateDate, getLatestUpdates } from "@/lib/updates"

const focusAreas = ["Web 工具", "AI 应用", "教育产品", "开发者工具", "自动化", "产品实验"]

export default function HomePage() {
  const featuredProject = getFeaturedProject()
  const recentProjects = getRecentProjects(6)
  const buildingProjects = getBuildingProjects()
  const latestUpdates = getLatestUpdates(3)
  const stats = getProjectStats()

  return (
    <div>
      <section className="border-b border-border bg-white">
        <div className="container grid gap-4 py-3 sm:py-8 lg:grid-cols-[1.7fr_1fr] lg:items-center">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1 text-xs text-muted-foreground sm:text-sm">
              <Rocket className="h-4 w-4 text-primary" aria-hidden="true" />
              Hi, I&apos;m qiu · Web 开发者 · 公开构建中
            </div>
            <h1 className="max-w-3xl text-xl font-semibold leading-tight text-foreground sm:text-4xl">
              持续构建有价值的 Web 产品
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-5 text-muted-foreground sm:text-base sm:leading-7">
              专注开发实用 Web 工具、AI 应用和实验性项目，持续学习，持续迭代。
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-3">
              <Button asChild>
                <Link href="/projects">
                  查看项目
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/tools">
                  使用工具
                  <Wrench aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
          <Card className="hidden bg-background shadow-none sm:block">
            <CardContent className="grid grid-cols-3 gap-3 p-4">
              {stats.map((metric) => (
                <div key={metric.label} className="rounded-md bg-white p-4 text-center">
                  <div className="text-2xl font-semibold text-primary">
                    {metric.value}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {metric.label}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-b border-border bg-background py-2 sm:py-8">
        <div className="container">
          <Card className="overflow-hidden bg-white">
            <div className="grid gap-0 lg:grid-cols-[1.45fr_0.85fr]">
              <CardHeader className="p-3 sm:p-6">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge className="bg-primary text-primary-foreground">主推项目</Badge>
                  <StatusBadge status={featuredProject.status} />
                  <Badge variant="outline" className="bg-white">
                    {featuredProject.type}
                  </Badge>
                </div>
                <CardTitle className="text-lg sm:text-3xl">
                  {featuredProject.title}
                </CardTitle>
                <CardDescription className="max-w-3xl text-sm leading-5 sm:text-base sm:leading-7">
                  {featuredProject.description}
                </CardDescription>
                <div className="flex flex-wrap gap-2 pt-1 sm:pt-2">
                  {featuredProject.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="bg-white">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col justify-between gap-2 border-t bg-slate-50/80 p-3 sm:p-6 lg:border-l lg:border-t-0">
                <div className="hidden space-y-3 text-sm text-muted-foreground sm:block">
                  <div className="flex items-center justify-between gap-4">
                    <span>更新时间</span>
                    <span className="font-medium text-foreground">
                      {featuredProject.updatedAt ?? "持续更新"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>预计上线</span>
                    <span className="font-medium text-foreground">
                      {featuredProject.eta ?? "持续迭代"}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 lg:grid-cols-1 xl:grid-cols-3">
                  <Button asChild size="sm">
                    <Link href={featuredProject.demoUrl ?? `/projects/${featuredProject.slug}`}>
                      在线演示
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={featuredProject.githubUrl ?? "https://github.com/"} target="_blank">
                      <Github aria-hidden="true" />
                      GitHub
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/projects/${featuredProject.slug}`}>查看详情</Link>
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      </section>

      <section className="py-4 sm:py-10">
        <div className="container">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
                精选项目
              </h2>
              <p className="mt-1 text-sm leading-5 text-muted-foreground sm:text-base sm:leading-6">
                持续发布 Web 工具、AI 应用和实验性项目。
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/projects">查看全部项目</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/tools">
                  工具
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {recentProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} compact />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-white py-8 sm:py-10">
        <div className="container">
          <SectionHeading title="正在构建" description="当前正在推进的项目。" />
          <div className="grid gap-5 lg:grid-cols-2">
            {buildingProjects.map((project) => (
              <Card key={project.slug} className="shadow-none">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {project.longDescription ?? project.description}
                      </CardDescription>
                    </div>
                    <Badge variant={project.status}>进度 {project.progress}%</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <div className="mb-2 flex justify-between text-sm text-muted-foreground">
                      <span>当前进度</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      预计上线：{project.eta ?? "持续迭代"}
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-medium">最近完成</h3>
                      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        {(project.completed ?? []).slice(0, 3).map((item) => (
                          <li key={item} className="flex gap-2">
                            <CheckCircle2
                              className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                              aria-hidden="true"
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">下一步</h3>
                      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        {(project.nextSteps ?? []).slice(0, 3).map((item) => (
                          <li key={item} className="flex gap-2">
                            <Square
                              className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                              aria-hidden="true"
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-10">
        <div className="container">
          <SectionHeading title="最近更新" description="记录项目持续推进的开发日志。" />
          <div className="grid gap-4 lg:grid-cols-3">
            {latestUpdates.map((update) => (
              <Card key={update.slug} className="bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="outline" className="bg-white">
                      {formatUpdateDate(update.date)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {update.projectTitle}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{update.title}</CardTitle>
                  <CardDescription>{update.content}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-white py-8 sm:py-10">
        <div className="container">
          <Card className="overflow-hidden">
            <div className="grid gap-0 lg:grid-cols-[1.4fr_0.8fr]">
              <CardHeader className="p-6">
                <CardTitle>我的构建方向</CardTitle>
                <CardDescription className="max-w-2xl text-base leading-7">
                  这里不是一次性作品集，而是持续发布 Web 工具、AI 应用和产品实验的平台。
                </CardDescription>
                <div className="flex flex-wrap gap-2 pt-2">
                  {focusAreas.map((item) => (
                    <Badge key={item} variant="outline" className="bg-white">
                      {item}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-col gap-3 pt-3 sm:flex-row">
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
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-3 bg-background p-6 lg:grid-cols-1">
                {stats.map((metric) => (
                  <div key={metric.label} className="rounded-md bg-white p-4">
                    <div className="text-2xl font-semibold text-primary">
                      {metric.value}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {metric.label}
                    </div>
                  </div>
                ))}
              </CardContent>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
