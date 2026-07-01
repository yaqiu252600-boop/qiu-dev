import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const pendingFiles = [
  {
    subject_type: "history",
    input: path.join(
      root,
      "data",
      "pending-review",
      "jiangsu_2026_score_segments_history_ocr.csv",
    ),
    output: path.join(
      root,
      "data",
      "processed",
      "score-segments",
      "jiangsu_2026_score_segments_history.csv",
    ),
  },
  {
    subject_type: "physics",
    input: path.join(
      root,
      "data",
      "pending-review",
      "jiangsu_2026_score_segments_physics_ocr.csv",
    ),
    output: path.join(
      root,
      "data",
      "processed",
      "score-segments",
      "jiangsu_2026_score_segments_physics.csv",
    ),
  },
]

function parseCsvLine(line) {
  const cells = []
  let current = ""
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const next = line[index + 1]

    if (char === '"' && quoted && next === '"') {
      current += '"'
      index += 1
      continue
    }

    if (char === '"') {
      quoted = !quoted
      continue
    }

    if (char === "," && !quoted) {
      cells.push(current)
      current = ""
      continue
    }

    current += char
  }

  cells.push(current)
  return cells
}

function readCsv(filePath) {
  if (!fs.existsSync(filePath)) {
    return []
  }

  const content = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "")
  const lines = content.split(/\r?\n/).filter((line) => line.trim())

  if (lines.length < 2) {
    return []
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.trim())

  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line)
    return Object.fromEntries(
      headers.map((header, index) => [header, cells[index]?.trim() ?? ""]),
    )
  })
}

function isNumber(value) {
  return value !== "" && Number.isFinite(Number(value))
}

function validateRows(rows, label) {
  const errors = []
  let previousScore = Number.POSITIVE_INFINITY
  let previousCumulative = -1

  rows.forEach((row, index) => {
    const rowLabel = `${label} 第 ${index + 1} 行`

    for (const field of ["score", "same_score_count", "cumulative_count"]) {
      if (!isNumber(row[field])) {
        errors.push(`${rowLabel}: ${field} 必须是数字`)
      }
    }

    const score = Number(row.score)
    const cumulative = Number(row.cumulative_count)

    if (Number.isFinite(score) && score > previousScore) {
      errors.push(`${rowLabel}: score 未按原表顺序递减`)
    }

    if (Number.isFinite(cumulative) && cumulative < previousCumulative) {
      errors.push(`${rowLabel}: cumulative_count 未递增`)
    }

    previousScore = score
    previousCumulative = cumulative
  })

  return errors
}

const confirm = process.argv.includes("--confirm")
const summary = []
const allErrors = []

for (const file of pendingFiles) {
  const rows = readCsv(file.input)
  const errors = validateRows(rows, file.subject_type)

  summary.push({
    subject_type: file.subject_type,
    input: path.relative(root, file.input),
    rows: rows.length,
    errors: errors.length,
  })
  allErrors.push(...errors)

  if (confirm && rows.length > 0 && errors.length === 0) {
    fs.mkdirSync(path.dirname(file.output), { recursive: true })
    fs.copyFileSync(file.input, file.output)
  }
}

console.log(JSON.stringify({ confirm, summary, errors: allErrors }, null, 2))

if (allErrors.length > 0) {
  process.exitCode = 1
}
