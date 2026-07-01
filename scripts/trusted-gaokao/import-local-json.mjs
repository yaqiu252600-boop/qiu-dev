import fs from "fs"
import path from "path"
import { spawnSync } from "child_process"

const [, , dataType, inputPath, outputPath] = process.argv

function fail(message) {
  console.error(message)
  process.exit(1)
}

if (!dataType || !inputPath) {
  fail(
    "Usage: node scripts/trusted-gaokao/import-local-json.mjs <universities|score_segments|admission_scores|admission_plans> <input.json> [output.csv]",
  )
}

if (!fs.existsSync(inputPath)) {
  fail(`Input file does not exist: ${inputPath}`)
}

const raw = fs.readFileSync(inputPath, "utf8").replace(/^\uFEFF/, "")
const rows = JSON.parse(raw)

if (!Array.isArray(rows)) {
  fail("Input JSON must be an array of records.")
}

const headers = Array.from(
  rows.reduce((set, row) => {
    Object.keys(row ?? {}).forEach((key) => set.add(key))
    return set
  }, new Set()),
)

function csvValue(value) {
  const text = Array.isArray(value)
    ? value.join("|")
    : value === null || value === undefined
      ? ""
      : String(value)

  if (/[",\r\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`
  }

  return text
}

const tempPath = path.join(
  "data",
  "pending-review",
  `${path.basename(inputPath, path.extname(inputPath))}.csv`,
)

fs.mkdirSync(path.dirname(tempPath), { recursive: true })
fs.writeFileSync(
  tempPath,
  `${headers.join(",")}\n${rows
    .map((row) => headers.map((header) => csvValue(row[header])).join(","))
    .join("\n")}\n`,
  "utf8",
)

const result = spawnSync(
  process.execPath,
  [
    "scripts/trusted-gaokao/import-local-csv.mjs",
    dataType,
    tempPath,
    outputPath ?? "",
  ].filter(Boolean),
  { stdio: "inherit" },
)

process.exit(result.status ?? 1)
