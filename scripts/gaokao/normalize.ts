import fs from "fs"
import path from "path"

type RawRow = Record<string, string>

const requiredAdmissionFields = [
  "province",
  "year",
  "schoolName",
  "subjectType",
  "sourceName",
  "sourceUrl",
]

function readCsv(filePath: string): RawRow[] {
  const raw = fs.readFileSync(filePath, "utf8")
  const [headerLine, ...lines] = raw.split(/\r?\n/).filter(Boolean)
  const headers = headerLine.split(",").map((item) => item.trim())

  return lines.map((line) => {
    const values = line.split(",").map((item) => item.trim())
    return headers.reduce<RawRow>((row, header, index) => {
      row[header] = values[index] ?? ""
      return row
    }, {})
  })
}

function readInput(filePath: string): RawRow[] {
  const ext = path.extname(filePath).toLowerCase()

  if (ext === ".json") {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"))
    return Array.isArray(parsed) ? parsed : []
  }

  if (ext === ".csv") {
    return readCsv(filePath)
  }

  throw new Error("当前 normalize 脚本只处理 JSON / CSV。Excel 请先人工另存为 CSV。")
}

function normalizeAdmissionScores(rows: RawRow[]) {
  return rows.map((row, index) => ({
    id: row.id || `local-admission-${String(index + 1).padStart(4, "0")}`,
    province: row.province,
    year: Number(row.year),
    schoolName: row.schoolName,
    majorName: row.majorName || undefined,
    subjectType: row.subjectType,
    batch: row.batch || "未标注批次",
    minScore: row.minScore ? Number(row.minScore) : undefined,
    minRank: row.minRank ? Number(row.minRank) : undefined,
    avgScore: row.avgScore ? Number(row.avgScore) : undefined,
    maxScore: row.maxScore ? Number(row.maxScore) : undefined,
    sourceName: row.sourceName,
    sourceUrl: row.sourceUrl,
    updatedAt: row.updatedAt || new Date().toISOString().slice(0, 10),
  }))
}

function validateRows(rows: RawRow[]) {
  const missing = rows.flatMap((row, index) =>
    requiredAdmissionFields
      .filter((field) => !row[field])
      .map((field) => `第 ${index + 1} 行缺少 ${field}`),
  )

  if (missing.length > 0) {
    throw new Error(missing.join("\n"))
  }
}

const [, , inputPath, outputPath] = process.argv

if (!inputPath || !outputPath) {
  throw new Error("用法：node normalize.js <input.json|input.csv> <output.json>")
}

const rows = readInput(inputPath)
validateRows(rows)
const normalized = normalizeAdmissionScores(rows)
fs.writeFileSync(outputPath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8")
console.log(`已输出 ${normalized.length} 条记录到 ${outputPath}`)
