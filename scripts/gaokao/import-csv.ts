import fs from "fs"
import path from "path"

function parseCsv(filePath: string) {
  const raw = fs.readFileSync(filePath, "utf8")
  const [headerLine, ...lines] = raw.split(/\r?\n/).filter(Boolean)
  const headers = headerLine.split(",").map((item) => item.trim())

  return lines.map((line) => {
    const values = line.split(",").map((item) => item.trim())
    return headers.reduce<Record<string, string>>((row, header, index) => {
      row[header] = values[index] ?? ""
      return row
    }, {})
  })
}

const [, , datasetName, inputPath] = process.argv

if (!datasetName || !inputPath) {
  throw new Error("用法：node import-csv.js <dataset-name> <input.csv>")
}

const rows = parseCsv(inputPath)
const hasMissingSource = rows.some((row) => !row.sourceName || !row.sourceUrl)

if (hasMissingSource) {
  throw new Error("真实数据必须包含 sourceName 和 sourceUrl，缺少来源的数据不能导入。")
}

const outputPath = path.join(
  process.cwd(),
  "data",
  "gaokao",
  "processed",
  `${datasetName}.json`,
)

fs.writeFileSync(outputPath, `${JSON.stringify(rows, null, 2)}\n`, "utf8")
console.log(`已导入 ${rows.length} 条记录到 ${outputPath}`)
