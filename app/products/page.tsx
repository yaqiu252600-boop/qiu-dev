import { ProjectCard } from "@/components/project-card"
import { SectionHeading } from "@/components/section-heading"
import { projects } from "@/lib/projects"

export default function ProductsPage() {
  const productProjects = projects.filter(
    (project) => project.status === "live" || project.featured || project.tool,
  )

  return (
    <section className="page-section">
      <div className="container">
        <SectionHeading
          title="产品"
          description="从项目中筛选出可体验、可持续迭代的产品和工具。"
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {productProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}
