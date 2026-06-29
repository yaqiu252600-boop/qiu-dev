import { ProjectCard } from "@/components/project-card"
import { SectionHeading } from "@/components/section-heading"
import { getRecentProjects, projects } from "@/lib/projects"

export default function ProjectsPage() {
  const sortedProjects = getRecentProjects(projects.length)

  return (
    <section className="page-section">
      <div className="container">
        <SectionHeading
          title="所有项目"
          description="统一展示已经上线、正在开发、处于设计阶段和计划中的 Web 项目。"
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sortedProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}
