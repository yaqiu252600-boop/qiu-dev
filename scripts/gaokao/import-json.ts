import fs from "fs"
import path from "path"

const allowedDatasets = new Set([
  "schools",
  "majors",
  "admission-scores",
  "score-ranks",
  "province-rules",
  "enrollment-plans",
])

const [, , datasetName, inputPath] = process.argv

if (!datasetName || !inputPath) {
  throw new Error("用法：node import-json.js <dataset-name> <input.json>")
}

if (!allowedDatasets.has(datasetName)) {
  throw new Error(`不支持的数据集：${datasetName}`)
}

const rows = JSON.parse(fs.readFileSync(inputPath, "utf8"))

if (!Array.isArray(rows)) {
  throw new Error("导入文件必须是 JSON 数组")
}

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
