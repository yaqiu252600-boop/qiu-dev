import fs from "fs"
import path from "path"

const processedDir = path.join(process.cwd(), "data", "gaokao", "processed")

function read(name: string) {
  const filePath = path.join(processedDir, `${name}.json`)

  if (!fs.existsSync(filePath)) {
    return []
  }

  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"))
  return Array.isArray(parsed) ? parsed : []
}

const datasets = [
  "schools",
  "majors",
  "admission-scores",
  "score-ranks",
  "province-rules",
  "enrollment-plans",
]

for (const dataset of datasets) {
  const rows = read(dataset)
  const demoCount = rows.filter((row) => row.isDemo).length
  const missingSourceCount = rows.filter((row) => !row.sourceName && dataset !== "score-ranks").length
  const provinces = new Set(rows.map((row) => row.province).filter(Boolean))

  console.log(
    `${dataset}: ${rows.length} 条，演示数据 ${demoCount} 条，涉及省份 ${provinces.size} 个，缺少来源 ${missingSourceCount} 条`,
  )
}
