import type { MetadataRoute } from "next"

import { projects } from "@/lib/projects"

const siteUrl = "https://qiu.dev"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/projects",
    "/products",
    "/products/gaokao-volunteer",
    "/tools",
    "/tools/droidlink",
    "/tools/pdf-to-word",
    "/tools/video-tools",
    "/tools/gaokao-volunteer",
    "/data-sources",
    "/about",
    "/contact",
  ]

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: new Date("2026-06-29"),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    })),
    ...projects.map((project) => ({
      url: `${siteUrl}/projects/${project.slug}`,
      lastModified: project.updatedAt
        ? new Date(project.updatedAt)
        : new Date("2026-06-29"),
      changeFrequency: "monthly" as const,
      priority: project.featured ? 0.9 : 0.7,
    })),
  ]
}
