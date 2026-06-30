import fs from "fs"
import path from "path"

type DatasetName =
  | "admission-scores"
  | "score-ranks"
  | "enrollment-plans"
  | "schools"
  | "majors"
  | "province-rules"

const processedDir = path.join(process.cwd(), "data", "gaokao", "processed")

const fieldRules: Record<DatasetName, string[]> = {
  "admission-scores": [
    "province",
    "year",
    "schoolName",
    "subjectType",
    "sourceName",
    "sourceUrl",
  ],
  "score-ranks": [
    "province",
    "year",
    "subjectType",
    "score",
    "cumulativeCount",
    "sourceName",
    "sourceUrl",
  ],
  "enrollment-plans": [
    "province",
    "year",
    "schoolName",
    "majorName",
    "sourceName",
    "sourceUrl",
  ],
  schools: ["id", "name", "province", "city", "tags", "sourceName", "sourceUrl"],
  majors: [
    "id",
    "name",
    "category",
    "suitableInterests",
    "careerDirections",
    "sourceName",
    "sourceUrl",
  ],
  "province-rules": ["province", "scoreFullMark", "subjectTypes", "batchTypes"],
}

function readDataset(name: DatasetName) {
  const filePath = path.join(processedDir, `${name}.json`)

  if (!fs.existsSync(filePath)) {
    return []
  }

  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"))
  return Array.isArray(parsed) ? parsed : []
}

function hasValue(value: unknown) {
  return Array.isArray(value) ? value.length > 0 : value !== undefined && value !== ""
}

const datasetNames = Object.keys(fieldRules) as DatasetName[]
let errorCount = 0

for (const datasetName of datasetNames) {
  const rows = readDataset(datasetName)
  const requiredFields = fieldRules[datasetName]

  rows.forEach((row: Record<string, unknown>, index: number) => {
    requiredFields.forEach((field) => {
      if (!hasValue(row[field])) {
        errorCount += 1
        console.error(`${datasetName}.json 第 ${index + 1} 条缺少 ${field}`)
      }
    })

    if (
      datasetName === "admission-scores" &&
      !hasValue(row.minScore) &&
      !hasValue(row.minRank)
    ) {
      errorCount += 1
      console.error(`${datasetName}.json 第 ${index + 1} 条缺少 minScore / minRank`)
    }
  })

  console.log(`${datasetName}.json: ${rows.length} 条`)
}

if (errorCount > 0) {
  throw new Error(`数据校验失败：${errorCount} 个问题`)
}

console.log("数据校验通过")
