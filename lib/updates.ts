import fs from "fs"
import path from "path"

import { getProjectBySlug } from "@/lib/projects"

export type UpdateLog = {
  slug: string
  date: string
  project: string
  projectTitle: string
  title: string
  type: string
  content: string
}

const updatesDirectory = path.join(process.cwd(), "content", "updates")

function parseFrontmatter(fileName: string, raw: string): UpdateLog | null {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)

  if (!match) {
    return null
  }

  const frontmatter = match[1].split(/\r?\n/).reduce<Record<string, string>>(
    (acc, line) => {
      const separatorIndex = line.indexOf(":")

      if (separatorIndex === -1) {
        return acc
      }

      const key = line.slice(0, separatorIndex).trim()
      const value = line
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^["']|["']$/g, "")

      acc[key] = value
      return acc
    },
    {},
  )

  if (!frontmatter.date || !frontmatter.project || !frontmatter.title) {
    return null
  }

  const content = match[2].trim()
  const project = getProjectBySlug(frontmatter.project)

  return {
    slug: fileName.replace(/\.md$/, ""),
    date: frontmatter.date,
    project: frontmatter.project,
    projectTitle: project?.title ?? frontmatter.project,
    title: frontmatter.title,
    type: frontmatter.type ?? "dev",
    content,
  }
}

export function getAllUpdates() {
  if (!fs.existsSync(updatesDirectory)) {
    return []
  }

  return fs
    .readdirSync(updatesDirectory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const filePath = path.join(updatesDirectory, fileName)
      const raw = fs.readFileSync(filePath, "utf8")
      return parseFrontmatter(fileName, raw)
    })
    .filter((update): update is UpdateLog => Boolean(update))
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date)
      return dateCompare === 0 ? b.slug.localeCompare(a.slug) : dateCompare
    })
}

export function getLatestUpdates(limit = 3) {
  return getAllUpdates().slice(0, limit)
}

export function getUpdatesForProject(projectSlug: string) {
  return getAllUpdates().filter((update) => update.project === projectSlug)
}

export function formatUpdateDate(date: string) {
  return date.replaceAll("-", ".")
}
