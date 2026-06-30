import fs from "fs"
import path from "path"

const filePath = path.join(
  process.cwd(),
  "data",
  "gaokao",
  "processed",
  "admission-scores.json",
)

const rows = JSON.parse(fs.readFileSync(filePath, "utf8"))

if (!Array.isArray(rows)) {
  throw new Error("admission-scores.json 必须是数组")
}

let errorCount = 0

rows.forEach((row, index) => {
  const required = ["province", "year", "schoolName", "subjectType", "sourceName", "sourceUrl"]

  required.forEach((field) => {
    if (!row[field]) {
      errorCount += 1
      console.error(`第 ${index + 1} 条缺少 ${field}`)
    }
  })

  if (row.minScore === undefined && row.minRank === undefined) {
    errorCount += 1
    console.error(`第 ${index + 1} 条必须包含 minScore 或 minRank`)
  }

  if (!row.isDemo && (!row.sourceName || !row.sourceUrl)) {
    errorCount += 1
    console.error(`第 ${index + 1} 条真实数据缺少来源，不允许标记为真实数据`)
  }
})

if (errorCount > 0) {
  throw new Error(`录取数据校验失败：${errorCount} 个问题`)
}

console.log(`admission-scores.json 校验通过：${rows.length} 条`)
