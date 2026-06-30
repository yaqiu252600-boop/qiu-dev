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
  throw new Error("用法：node import-local-json.js <dataset-name> <input.json>")
}

if (!allowedDatasets.has(datasetName)) {
  throw new Error(`不支持的数据集：${datasetName}`)
}

const parsed = JSON.parse(fs.readFileSync(inputPath, "utf8"))

if (!Array.isArray(parsed)) {
  throw new Error("导入文件必须是 JSON 数组")
}

const outputPath = path.join(
  process.cwd(),
  "data",
  "gaokao",
  "processed",
  `${datasetName}.json`,
)

fs.writeFileSync(outputPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8")
console.log(`已导入 ${parsed.length} 条记录到 ${outputPath}`)
