import Link from "next/link"
import { ArrowUpRight, Github } from "lucide-react"

import { StatusBadge } from "@/components/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Project } from "@/lib/projects"
import { cn } from "@/lib/utils"

export function ProjectCard({
  project,
  compact = false,
}: {
  project: Project
  compact?: boolean
}) {
  const detailUrl = `/projects/${project.slug}`
  const demoUrl = project.demoUrl ?? detailUrl
  const isExternalDemo = demoUrl.startsWith("http")

  return (
    <Card
      className={cn(
        "group flex h-full flex-col overflow-hidden bg-white transition-colors hover:border-primary/30",
        compact ? "min-h-[240px]" : "min-h-[270px]",
      )}
    >
      <CardHeader className="pb-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Badge variant="secondary" className="bg-accent text-accent-foreground">
            {project.type}
          </Badge>
          <StatusBadge status={project.status} />
        </div>
        <CardTitle className="text-xl leading-tight">{project.title}</CardTitle>
        <CardDescription className="leading-6">
          {project.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="bg-white">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="grid gap-2 border-t bg-slate-50/70 p-4 sm:grid-cols-3">
        <Button asChild size="sm">
          <Link href={demoUrl} target={isExternalDemo ? "_blank" : undefined}>
            在线演示
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={project.githubUrl ?? "https://github.com/"} target="_blank">
            <Github aria-hidden="true" />
            GitHub
          </Link>
        </Button>
        <Button asChild size="sm" variant="ghost">
          <Link href={detailUrl}>查看详情</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
