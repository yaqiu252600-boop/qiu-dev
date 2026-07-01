import fs from "fs"
import path from "path"

const [, , dataType, inputPath, outputPath] = process.argv

const TARGET_DIRS = {
  universities: "data/processed/universities",
  score_segments: "data/processed/score-segments",
  admission_scores: "data/processed/admission-scores",
  admission_plans: "data/processed/admission-plans",
}

const REQUIRED_FIELDS = {
  universities: ["school_code", "name", "source_name", "source_url"],
  score_segments: [
    "province",
    "year",
    "subject_type",
    "score",
    "cumulative_count",
    "source_name",
    "source_url",
  ],
  admission_scores: [
    "province",
    "year",
    "university_name",
    "subject_type",
    "source_name",
    "source_url",
  ],
  admission_plans: [
    "province",
    "year",
    "university_name",
    "major_name",
    "source_name",
    "source_url",
  ],
}

function parseCsv(content) {
  const rows = []
  let current = []
  let value = ""
  let inQuotes = false

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index]
    const next = content[index + 1]

    if (char === '"' && inQuotes && next === '"') {
      value += '"'
      index += 1
      continue
    }

    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (char === "," && !inQuotes) {
      current.push(value)
      value = ""
      continue
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1
      }
      current.push(value)
      if (current.some((item) => item.trim() !== "")) {
        rows.push(current)
      }
      current = []
      value = ""
      continue
    }

    value += char
  }

  current.push(value)
  if (current.some((item) => item.trim() !== "")) {
    rows.push(current)
  }

  return rows
}

function toRecords(rows) {
  const [headers, ...body] = rows
  return body.map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])),
  )
}

function fail(message) {
  console.error(message)
  process.exit(1)
}

if (!dataType || !inputPath || !(dataType in TARGET_DIRS)) {
  fail(
    "Usage: node scripts/trusted-gaokao/import-local-csv.mjs <universities|score_segments|admission_scores|admission_plans> <input.csv> [output.csv]",
  )
}

if (!fs.existsSync(inputPath)) {
  fail(`Input file does not exist: ${inputPath}`)
}

const content = fs.readFileSync(inputPath, "utf8").replace(/^\uFEFF/, "")
const records = toRecords(parseCsv(content))
const requiredFields = REQUIRED_FIELDS[dataType]
const errors = []

records.forEach((record, index) => {
  requiredFields.forEach((field) => {
    if (!String(record[field] ?? "").trim()) {
      errors.push(`row ${index + 2}: missing ${field}`)
    }
  })

  if (dataType === "admission_scores") {
    const hasScore = String(record.min_score ?? "").trim()
    const hasRank = String(record.min_rank ?? "").trim()
    if (!hasScore && !hasRank) {
      errors.push(`row ${index + 2}: min_score or min_rank is required`)
    }
  }
})

if (errors.length) {
  console.error(errors.slice(0, 30).join("\n"))
  if (errors.length > 30) {
    console.error(`... ${errors.length - 30} more errors`)
  }
  process.exit(1)
}

const targetPath =
  outputPath ??
  path.join(TARGET_DIRS[dataType], path.basename(inputPath).replace(/\s+/g, "-"))

fs.mkdirSync(path.dirname(targetPath), { recursive: true })
fs.copyFileSync(inputPath, targetPath)

console.log(
  JSON.stringify(
    {
      ok: true,
      dataType,
      rows: records.length,
      targetPath,
    },
    null,
    2,
  ),
)
