const [, , inputPath] = process.argv

if (!inputPath) {
  throw new Error("用法：node import-excel.js <input.xlsx>")
}

throw new Error(
  [
    "当前项目尚未引入 Excel 解析依赖。",
    "请先把官方 Excel 人工另存为 CSV，再使用 import-csv.ts 导入。",
    "后续如需直接导入 Excel，应先确认依赖许可和文件来源，再接入 xlsx / exceljs 等解析库。",
  ].join("\n"),
)

export {}
