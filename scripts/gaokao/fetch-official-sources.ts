import { createWriteStream } from "node:fs"
import { mkdir } from "node:fs/promises"
import { dirname, join } from "node:path"
import { pipeline } from "node:stream/promises"
import { get } from "node:https"

import officialSources from "../../data/gaokao/sources/official-open-data-index.json"
import type { OfficialOpenDataSource } from "../../lib/gaokao-types"

const outputRoot = join(process.cwd(), "data", "gaokao", "raw", "official")

function download(url: string, outputPath: string) {
  return new Promise<void>((resolve, reject) => {
    get(url, { headers: { "User-Agent": "qiu-dev-gaokao-data/0.1" } }, (response) => {
      if (!response.statusCode || response.statusCode >= 400) {
        reject(new Error(`下载失败：HTTP ${response.statusCode ?? "unknown"} ${url}`))
        response.resume()
        return
      }

      pipeline(response, createWriteStream(outputPath)).then(resolve).catch(reject)
    }).on("error", reject)
  })
}

async function main() {
  const items = officialSources as OfficialOpenDataSource[]
  const downloadable = items.filter(
    (item) =>
      item.rawFileUrl &&
      item.rawFileName &&
      item.reusePolicy === "raw_download_allowed",
  )

  if (downloadable.length === 0) {
    console.log(
      "没有可自动下载的来源。requires_review 的来源只登记入口，确认授权边界后再改为 raw_download_allowed。",
    )
    return
  }

  for (const item of downloadable) {
    const outputPath = join(
      outputRoot,
      item.province,
      String(item.year),
      item.rawFileName as string,
    )
    await mkdir(dirname(outputPath), { recursive: true })
    await download(item.rawFileUrl as string, outputPath)
    console.log(`已下载：${item.title} -> ${outputPath}`)

    await new Promise((resolve) => setTimeout(resolve, 1500))
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
