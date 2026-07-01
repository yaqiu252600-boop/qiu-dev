import fs from "node:fs/promises"
import path from "node:path"

const FILES = [
  {
    url: "https://www.jseea.cn/webfile/upload/2024/07-18/09-11-430408314109108.xls",
    target: "data/raw/jiangsu/2024-admission-scores/jiangsu_2024_undergraduate_history.xls",
    label: "江苏 2024 普通类本科批次平行志愿投档线（历史等科目类）",
  },
  {
    url: "https://www.jseea.cn/webfile/upload/2024/07-18/11-00-490856-746889704.xls",
    target: "data/raw/jiangsu/2024-admission-scores/jiangsu_2024_undergraduate_physics.xls",
    label: "江苏 2024 普通类本科批次平行志愿投档线（物理等科目类）",
  },
  {
    url: "https://www.jseea.cn/webfile/upload/2023/07-18/10-05-510166-183377989.xls",
    target: "data/raw/jiangsu/2023-admission-scores/jiangsu_2023_undergraduate_physics.xls",
    label: "江苏 2023 普通类本科批次平行志愿投档线（物理等科目类）",
  },
  {
    url: "https://www.jseea.cn/webfile/upload/2023/07-18/10-05-510148-1404562985.xls",
    target: "data/raw/jiangsu/2023-admission-scores/jiangsu_2023_undergraduate_history.xls",
    label: "江苏 2023 普通类本科批次平行志愿投档线（历史等科目类）",
  },
]

async function download(file) {
  await fs.mkdir(path.dirname(file.target), { recursive: true })

  try {
    const response = await fetch(file.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 qiu-dev trusted public data importer; contact: qiu.dev",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const bytes = Buffer.from(await response.arrayBuffer())
    await fs.writeFile(file.target, bytes)

    return {
      ...file,
      ok: true,
      bytes: bytes.length,
      downloaded_at: new Date().toISOString(),
    }
  } catch (error) {
    const failurePath = `${file.target}.download-error.json`
    const failure = {
      ...file,
      ok: false,
      downloaded_at: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    }
    await fs.writeFile(failurePath, `${JSON.stringify(failure, null, 2)}\n`)
    return failure
  }
}

const results = []

for (const file of FILES) {
  results.push(await download(file))
}

console.log(JSON.stringify(results, null, 2))

if (results.some((result) => !result.ok)) {
  process.exitCode = 1
}
