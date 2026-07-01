import fs from "node:fs"
import path from "node:path"

const root = process.cwd()

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

const errors = []

function requireField(row, field, label) {
  if (!row[field]) {
    errors.push(`${label} 缺少 ${field}`)
  }
}

function validateUniversities() {
  const rows = readCsv(path.join(root, "data/processed/universities/moe_universities_2026.csv"))
  const codes = new Set()

  rows.forEach((row, index) => {
    requireField(row, "school_code", `universities 第 ${index + 1} 行`)
    requireField(row, "name", `universities 第 ${index + 1} 行`)
    requireField(row, "source_name", `universities 第 ${index + 1} 行`)
    requireField(row, "source_url", `universities 第 ${index + 1} 行`)

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

  for (const filePath of listCsvFiles(path.join(root, "data/processed/score-segments"))) {
    const rows = readCsv(filePath)
    count += rows.length
    const groups = new Map()

    rows.forEach((row, index) => {
      const label = `${path.basename(filePath)} 第 ${index + 1} 行`
      requireField(row, "year", label)
      requireField(row, "province", label)
      requireField(row, "subject_type", label)
      requireField(row, "source_name", label)
      requireField(row, "source_url", label)

      if (Number.isNaN(Number(row.score))) {
        errors.push(`${label} score 必须是数字`)
      }

      if (Number.isNaN(Number(row.cumulative_count))) {
        errors.push(`${label} cumulative_count 必须是数字`)
      }

      const key = `${row.year}-${row.province}-${row.subject_type}`
      const current = groups.get(key) ?? []
      current.push(row)
      groups.set(key, current)
    })

    for (const [key, rowsInGroup] of groups) {
      const sorted = rowsInGroup.sort((left, right) => Number(right.score) - Number(left.score))
      let previous = -1

      sorted.forEach((row) => {
        const cumulative = Number(row.cumulative_count)

        if (cumulative < previous) {
          errors.push(`${path.basename(filePath)} ${key} cumulative_count 未递增`)
        }

        previous = cumulative
      })
    }
  }

  return count
}

function validateAdmissionScores() {
  let count = 0

  for (const filePath of listCsvFiles(path.join(root, "data/processed/admission-scores"))) {
    const rows = readCsv(filePath)
    count += rows.length

    rows.forEach((row, index) => {
      const label = `${path.basename(filePath)} 第 ${index + 1} 行`
      requireField(row, "university_name", label)
      requireField(row, "source_name", label)
      requireField(row, "source_url", label)

      if (Number.isNaN(Number(row.min_score))) {
        errors.push(`${label} min_score 必须是数字`)
      }

      if (row.min_rank && Number.isNaN(Number(row.min_rank))) {
        errors.push(`${label} min_rank 如果存在必须是数字`)
      }
    })
  }

  return count
}

const summary = {
  universities: validateUniversities(),
  score_segments: validateScoreSegments(),
  admission_scores: validateAdmissionScores(),
}

console.log(JSON.stringify(summary, null, 2))

if (errors.length > 0) {
  console.error(errors.join("\n"))
  process.exitCode = 1
}
