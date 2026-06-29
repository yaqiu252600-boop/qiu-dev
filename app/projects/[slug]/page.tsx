import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight, CheckCircle2, Github, Square } from "lucide-react"

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
  getProjectBySlug,
  getRelatedProjects,
  projects,
} from "@/lib/projects"
import {
  formatUpdateDate,
  getUpdatesForProject,
} from "@/lib/updates"

type ProjectDetailPageProps = {
  params: {
    slug: string
  }
}

export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }))
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const project = getProjectBySlug(params.slug)

  if (!project) {
    notFound()
  }

  const updates = getUpdatesForProject(project.slug)
  const relatedProjects = getRelatedProjects(project)
  const progress = project.progress ?? 0

  return (
    <div>
      <section className="border-b border-border bg-white py-10">
        <div className="container">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <StatusBadge status={project.status} />
            <Badge variant="outline" className="bg-white">
              {project.type}
            </Badge>
            {project.tool ? <Badge variant="secondary">工具项目</Badge> : null}
          </div>
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
            <div>
              <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                {project.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
                {project.longDescription ?? project.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-white">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <Link href={project.demoUrl ?? `/projects/${project.slug}`}>
                    在线演示
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={project.githubUrl ?? "https://github.com/"} target="_blank">
                    <Github aria-hidden="true" />
                    GitHub
                  </Link>
                </Button>
              </div>
            </div>
            <Card className="bg-background shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">项目状态</CardTitle>
                <CardDescription>
                  更新时间：{project.updatedAt ?? "持续更新"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-2 flex justify-between text-sm text-muted-foreground">
                    <span>开发进度</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <div className="rounded-md bg-white p-4 text-sm">
                  <div className="text-muted-foreground">预计上线</div>
                  <div className="mt-1 font-medium">{project.eta ?? "持续迭代"}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container grid gap-5 lg:grid-cols-2">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>最近完成</CardTitle>
              <CardDescription>已经推进完成的关键事项。</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {(project.completed ?? []).map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>下一步计划</CardTitle>
              <CardDescription>后续迭代会优先处理的方向。</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {(project.nextSteps ?? []).map((item) => (
                  <li key={item} className="flex gap-2">
                    <Square
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-y border-border bg-white py-10">
        <div className="container">
          <SectionHeading title="相关开发日志" description="与这个项目相关的最近更新。" />
          {updates.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {updates.map((update) => (
                <Card key={update.slug} className="shadow-none">
                  <CardHeader>
                    <Badge variant="outline" className="w-fit bg-white">
                      {formatUpdateDate(update.date)}
                    </Badge>
                    <CardTitle className="text-lg">{update.title}</CardTitle>
                    <CardDescription>{update.content}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-none">
              <CardHeader>
                <CardDescription>这个项目还没有关联开发日志。</CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </section>

      <section className="py-10">
        <div className="container">
          <SectionHeading title="相关推荐项目" />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {relatedProjects.map((item) => (
              <ProjectCard key={item.slug} project={item} compact />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
