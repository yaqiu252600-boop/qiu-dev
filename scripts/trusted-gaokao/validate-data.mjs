import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const errors = []
const allowedSourceStatuses = [
  "verified",
  "imported",
  "pending_review",
  "partial",
  "missing",
  "blocked",
  "failed",
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

function listCsvFiles(dir) {
  if (!fs.existsSync(dir)) {
    return []
  }

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".csv"))
    .map((file) => path.join(dir, file))
}

function requireField(row, field, label) {
  if (!row[field]) {
    errors.push(`${label} 缺少 ${field}`)
  }
}

function requireNumber(row, field, label) {
  if (row[field] === "" || Number.isNaN(Number(row[field]))) {
    errors.push(`${label} ${field} 必须是数字`)
  }
}

function validateUniversities() {
  const rows = readCsv(
    path.join(root, "data/processed/universities/moe_universities_2026.csv"),
  )
  const codes = new Set()

  rows.forEach((row, index) => {
    const label = `universities 第 ${index + 1} 行`
    requireField(row, "school_code", label)
    requireField(row, "name", label)
    requireField(row, "source_name", label)
    requireField(row, "source_url", label)

    if (row.school_code) {
      if (codes.has(row.school_code)) {
        errors.push(`universities school_code 重复：${row.school_code}`)
      }

      codes.add(row.school_code)
    }
  })

  return rows.length
}

function validateScoreSegments() {
  let count = 0

  for (const filePath of listCsvFiles(
    path.join(root, "data/processed/score-segments"),
  )) {
    const rows = readCsv(filePath)
    count += rows.length
    const groups = new Map()

    rows.forEach((row, index) => {
      const label = `${path.basename(filePath)} 第 ${index + 1} 行`
      for (const field of [
        "year",
        "province",
        "subject_type",
        "score",
        "same_score_count",
        "cumulative_count",
        "source_name",
        "source_url",
        "source_updated_at",
      ]) {
        requireField(row, field, label)
      }

      requireNumber(row, "score", label)
      requireNumber(row, "same_score_count", label)
      requireNumber(row, "cumulative_count", label)

      const key = `${row.year}-${row.province}-${row.subject_type}`
      const current = groups.get(key) ?? []
      current.push(row)
      groups.set(key, current)
    })

    for (const [key, rowsInGroup] of groups) {
      let previousScore = Number.POSITIVE_INFINITY
      let previousCumulative = -1

      rowsInGroup.forEach((row) => {
        const score = Number(row.score)
        const cumulative = Number(row.cumulative_count)

        if (score > previousScore) {
          errors.push(`${path.basename(filePath)} ${key} score 未递减`)
        }

        if (cumulative < previousCumulative) {
          errors.push(`${path.basename(filePath)} ${key} cumulative_count 未递增`)
        }

        previousScore = score
        previousCumulative = cumulative
      })
    }
  }

  return count
}

function validateAdmissionScores() {
  let count = 0

  for (const filePath of listCsvFiles(
    path.join(root, "data/processed/admission-scores"),
  )) {
    const rows = readCsv(filePath)
    count += rows.length

    rows.forEach((row, index) => {
      const label = `${path.basename(filePath)} 第 ${index + 1} 行`
      for (const field of [
        "year",
        "province",
        "subject_type",
        "batch_name",
        "university_code",
        "university_name",
        "min_score",
        "source_name",
        "source_url",
        "source_updated_at",
      ]) {
        requireField(row, field, label)
      }

      requireNumber(row, "min_score", label)

      if (row.min_rank && Number.isNaN(Number(row.min_rank))) {
        errors.push(`${label} min_rank 如果存在必须是数字`)
      }
    })
  }

  return count
}

function validateSourceManifest() {
  const files = [
    path.join(root, "data/sources/source_manifest.json"),
    path.join(root, "data/sources/other_provinces_source_manifest.json"),
  ].filter((filePath) => fs.existsSync(filePath))
  let count = 0

  files.forEach((filePath) => {
    const rows = JSON.parse(fs.readFileSync(filePath, "utf8"))
    count += rows.length

    rows.forEach((row, index) => {
      const label = `${path.basename(filePath)} 第 ${index + 1} 条`
      for (const field of [
        "data_type",
        "province",
        "year",
        "status",
        "source_name",
        "source_url",
        "source_updated_at",
        "raw_files",
        "processed_files",
      ]) {
        if (row[field] === undefined || row[field] === null || row[field] === "") {
          errors.push(`${label} 缺少 ${field}`)
        }
      }

      if (!allowedSourceStatuses.includes(row.status)) {
        errors.push(`${label} status 非法：${row.status}`)
      }
    })
  })

  return count
}

const summary = {
  universities: validateUniversities(),
  score_segments: validateScoreSegments(),
  admission_scores: validateAdmissionScores(),
  source_manifest: validateSourceManifest(),
}

console.log(JSON.stringify(summary, null, 2))

if (errors.length > 0) {
  console.error(errors.join("\n"))
  process.exitCode = 1
}
