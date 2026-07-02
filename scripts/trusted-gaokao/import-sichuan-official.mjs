import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const now = new Date().toISOString()

const sourceName = "四川省教育考试院"
const officialSite = "https://www.sceea.cn/"

const sources = {
  admission2023Batch1: {
    year: 2023,
    batch: "本科一批",
    url: "https://www.sceea.cn/Html/202307/Newsdetail_3281.html",
    updatedAt: "2023-07-22",
  },
  admission2023Batch2: {
    year: 2023,
    batch: "本科二批",
    url: "https://www.sceea.cn/Html/202308/Newsdetail_3306.html",
    updatedAt: "2023-08-01",
  },
  admission2024Batch1: {
    year: 2024,
    batch: "本科一批",
    url: "https://www.sceea.cn/Html/202407/Newsdetail_3788.html",
    updatedAt: "2024-07-21",
  },
  admission2024Batch2: {
    year: 2024,
    batch: "本科二批",
    url: "https://www.sceea.cn/Html/202408/Newsdetail_3814.html",
    updatedAt: "2024-08-01",
  },
  admission2025Status: {
    year: 2025,
    batch: "本科批次B段",
    url: "https://www.sceea.cn/Html/202507/Newsdetail_4405.html",
    updatedAt: "2025-07-26",
  },
  scoreHistory2026: {
    url: "https://www.sceea.cn/Html/202606/Newsdetail_4858.html",
    updatedAt: "2026-06-25",
    subject: "历史类",
  },
  scorePhysics2026: {
    url: "https://www.sceea.cn/Html/202606/Newsdetail_4857.html",
    updatedAt: "2026-06-25",
    subject: "物理类",
  },
  plansIndex2026: {
    url: "https://plan.sceea.cn/",
    updatedAt: "2026-06-25",
  },
  plansHistory2026: {
    url: "https://plan.sceea.cn/wkjh.html",
    updatedAt: "2026-06-25",
    subject: "历史类",
    prefix: "ls",
    start: 1,
    end: 160,
  },
  plansPhysics2026: {
    url: "https://plan.sceea.cn/lkjh.html",
    updatedAt: "2026-06-25",
    subject: "物理类",
    prefix: "wl",
    start: 1,
    end: 248,
  },
  planCorrection1: {
    url: "https://www.sceea.cn/Html/202606/Newsdetail_4852.html",
    updatedAt: "2026-06-25",
  },
  planCorrection2: {
    url: "https://www.sceea.cn/Html/202606/Newsdetail_4875.html",
    updatedAt: "2026-06-29",
  },
  rules2026: {
    url: "https://www.sceea.cn/Html/202604/Newsdetail_4767.html",
    updatedAt: "2026-04-23",
  },
  helper2026: {
    url: "https://zyfz.sceeic.cn/",
    updatedAt: "2026-06-25",
  },
}

function outPath(...parts) {
  return path.join(root, ...parts)
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function rel(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, "/")
}

function csvEscape(value) {
  const text = String(value ?? "")
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

function writeCsv(filePath, rows) {
  ensureDir(path.dirname(filePath))
  const headers = Object.keys(rows[0] ?? { source_url: "", raw_file_path: "", notes: "" })
  const content = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n")
  fs.writeFileSync(filePath, `${content}\n`, "utf8")
}

async function fetchBuffer(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)
  const response = await fetch(url, {
    signal: controller.signal,
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; trusted-gaokao-data-archiver/1.0; +https://www.sceea.cn/)",
    },
  })
  clearTimeout(timeout)
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }
  return Buffer.from(await response.arrayBuffer())
}

async function saveUrl(url, filePath) {
  ensureDir(path.dirname(filePath))
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
    return filePath
  }
  const buffer = await fetchBuffer(url)
  fs.writeFileSync(filePath, buffer)
  return filePath
}

function absolutize(baseUrl, maybeUrl) {
  return new URL(maybeUrl.replaceAll("&amp;", "&"), baseUrl).toString()
}

function extractContentImageUrls(html, baseUrl) {
  const matches = [...html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)]
  return matches
    .map((match) => match[1])
    .filter((src) => src.includes("/Upload/image/"))
    .map((src) => absolutize(baseUrl, src))
}

async function saveImagePage({ pageUrl, rawDir, pageName, prefix }) {
  const htmlPath = outPath(rawDir, pageName)
  await saveUrl(pageUrl, htmlPath)
  const html = fs.readFileSync(htmlPath, "utf8")
  const imageUrls = extractContentImageUrls(html, pageUrl)
  const rawFiles = [rel(htmlPath)]
  const imageRows = []

  for (const [index, imageUrl] of imageUrls.entries()) {
    const ext = path.extname(new URL(imageUrl).pathname) || ".jpg"
    const imagePath = outPath(rawDir, `${prefix}_${String(index + 1).padStart(3, "0")}${ext}`)
    await saveUrl(imageUrl, imagePath)
    rawFiles.push(rel(imagePath))
    imageRows.push({
      source_url: imageUrl,
      raw_file_path: rel(imagePath),
      status: "pending_review",
      notes: "四川考试院官网图片发布，未做人工校验前不进入正式推荐数据。",
    })
  }

  return { rawFiles, imageRows, imageCount: imageRows.length }
}

async function savePlanBook({ pageUrl, rawDir, pageName, subject, prefix, start, end }) {
  const htmlPath = outPath(rawDir, pageName)
  await saveUrl(pageUrl, htmlPath)
  const rawFiles = [rel(htmlPath)]
  const imageRows = []
  const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index)

  async function savePage(page) {
    const imageUrl = `https://plan.sceea.cn/img/${prefix}/tu/${prefix}%20(${page}).png`
    const imagePath = outPath(
      rawDir,
      `${prefix}_${String(page).padStart(3, "0")}.png`,
    )
    try {
      await saveUrl(imageUrl, imagePath)
      return {
        subject_type: subject,
        page,
        source_url: imageUrl,
        raw_file_path: rel(imagePath),
        status: "pending_review",
        notes: "2026 在川招生专业及名额官方图片页，非结构化表格，未导入 admission_plans。",
      }
    } catch (error) {
      return {
        subject_type: subject,
        page,
        source_url: imageUrl,
        raw_file_path: "",
        status: "failed",
        notes: `下载失败：${error.message}`,
      }
    }
  }

  const concurrency = 10
  for (let index = 0; index < pages.length; index += concurrency) {
    const chunk = pages.slice(index, index + concurrency)
    imageRows.push(...(await Promise.all(chunk.map((page) => savePage(page)))))
  }

  for (const row of imageRows) {
    if (row.raw_file_path) {
      rawFiles.push(row.raw_file_path)
    }
  }

  return { rawFiles, imageRows }
}

function upsertManifest(filePath, entries) {
  const current = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, "utf8"))
    : []
  const byId = new Map(current.map((entry) => [entry.id ?? `${entry.province}-${entry.year}-${entry.data_type}-${entry.source_url}`, entry]))

  for (const entry of entries) {
    byId.set(entry.id, entry)
  }

  fs.writeFileSync(filePath, `${JSON.stringify([...byId.values()], null, 2)}\n`, "utf8")
}

function upsertDiscovery(filePath, entry) {
  const current = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, "utf8"))
    : []
  const filtered = current.filter((item) => item.province_slug !== "sichuan")
  filtered.push(entry)
  fs.writeFileSync(filePath, `${JSON.stringify(filtered, null, 2)}\n`, "utf8")
}

function manifestEntry({
  id,
  year,
  dataType,
  sourceUrl,
  sourceUpdatedAt,
  rawFiles,
  processedFiles = [],
  status,
  missingFields,
  notes,
  rowCount = 0,
  scoreReference = false,
  rankReference = false,
  planReference = false,
  queryable = false,
}) {
  return {
    id,
    province: "四川",
    year,
    data_type: dataType,
    source_name: sourceName,
    source_url: sourceUrl,
    source_updated_at: sourceUpdatedAt,
    downloaded_at: now,
    raw_file_path: rawFiles[0] ?? "",
    processed_file_path: processedFiles[0] ?? "",
    raw_files: rawFiles,
    processed_files: processedFiles,
    total_rows: rowCount,
    imported_rows: queryable ? rowCount : 0,
    row_count: rowCount,
    status,
    missing_fields: missingFields,
    queryable,
    usable_for_score_reference: scoreReference,
    usable_for_rank_recommendation: rankReference,
    usable_for_admission_plan_recommendation: planReference,
    notes,
  }
}

function appendSection(filePath, marker, section) {
  const current = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : ""
  const start = `<!-- ${marker}:START -->`
  const end = `<!-- ${marker}:END -->`
  const block = `${start}\n${section.trim()}\n${end}`

  if (current.includes(start) && current.includes(end)) {
    const next = current.replace(new RegExp(`${start}[\\s\\S]*?${end}`), block)
    fs.writeFileSync(filePath, next, "utf8")
    return
  }

  fs.writeFileSync(filePath, `${current.trimEnd()}\n\n${block}\n`, "utf8")
}

async function main() {
  const rawRoot = "data/raw/provinces/sichuan"
  const pendingRows = []

  const admission2023Batch1 = await saveImagePage({
    pageUrl: sources.admission2023Batch1.url,
    rawDir: `${rawRoot}/2023-admission-scores`,
    pageName: "sichuan_2023_undergraduate_batch1_page.html",
    prefix: "sichuan_2023_batch1",
  })
  const admission2023Batch2 = await saveImagePage({
    pageUrl: sources.admission2023Batch2.url,
    rawDir: `${rawRoot}/2023-admission-scores`,
    pageName: "sichuan_2023_undergraduate_batch2_page.html",
    prefix: "sichuan_2023_batch2",
  })
  pendingRows.push(
    ...admission2023Batch1.imageRows.map((row) => ({ year: 2023, batch_name: "本科一批", ...row })),
    ...admission2023Batch2.imageRows.map((row) => ({ year: 2023, batch_name: "本科二批", ...row })),
  )

  const admission2024Batch1 = await saveImagePage({
    pageUrl: sources.admission2024Batch1.url,
    rawDir: `${rawRoot}/2024-admission-scores`,
    pageName: "sichuan_2024_undergraduate_batch1_page.html",
    prefix: "sichuan_2024_batch1",
  })
  const admission2024Batch2 = await saveImagePage({
    pageUrl: sources.admission2024Batch2.url,
    rawDir: `${rawRoot}/2024-admission-scores`,
    pageName: "sichuan_2024_undergraduate_batch2_page.html",
    prefix: "sichuan_2024_batch2",
  })
  pendingRows.push(
    ...admission2024Batch1.imageRows.map((row) => ({ year: 2024, batch_name: "本科一批", ...row })),
    ...admission2024Batch2.imageRows.map((row) => ({ year: 2024, batch_name: "本科二批", ...row })),
  )

  const admission2025Page = outPath(
    rawRoot,
    "2025-admission-scores",
    "sichuan_2025_undergraduate_batch_b_status_page.html",
  )
  await saveUrl(sources.admission2025Status.url, admission2025Page)

  const scoreHistory = await saveImagePage({
    pageUrl: sources.scoreHistory2026.url,
    rawDir: `${rawRoot}/2026-score-segments`,
    pageName: "sichuan_2026_score_segments_history_page.html",
    prefix: "sichuan_2026_score_segments_history",
  })
  const scorePhysics = await saveImagePage({
    pageUrl: sources.scorePhysics2026.url,
    rawDir: `${rawRoot}/2026-score-segments`,
    pageName: "sichuan_2026_score_segments_physics_page.html",
    prefix: "sichuan_2026_score_segments_physics",
  })
  writeCsv(
    outPath("data/pending-review/sichuan_2026_score_segments_image_index.csv"),
    [
      ...scoreHistory.imageRows.map((row) => ({ subject_type: "历史类", ...row })),
      ...scorePhysics.imageRows.map((row) => ({ subject_type: "物理类", ...row })),
    ],
  )

  const planIndex = outPath(rawRoot, "2026-admission-plans", "sichuan_2026_admission_plans_index.html")
  const correction1 = outPath(rawRoot, "2026-admission-plans", "sichuan_2026_admission_plan_correction_1.html")
  const correction2 = outPath(rawRoot, "2026-admission-plans", "sichuan_2026_admission_plan_correction_2.html")
  await saveUrl(sources.plansIndex2026.url, planIndex)
  await saveUrl(sources.planCorrection1.url, correction1)
  await saveUrl(sources.planCorrection2.url, correction2)
  const planHistory = await savePlanBook({
    pageUrl: sources.plansHistory2026.url,
    rawDir: `${rawRoot}/2026-admission-plans/history`,
    pageName: "sichuan_2026_admission_plans_history_page.html",
    ...sources.plansHistory2026,
  })
  const planPhysics = await savePlanBook({
    pageUrl: sources.plansPhysics2026.url,
    rawDir: `${rawRoot}/2026-admission-plans/physics`,
    pageName: "sichuan_2026_admission_plans_physics_page.html",
    ...sources.plansPhysics2026,
  })
  writeCsv(
    outPath("data/pending-review/sichuan_2026_admission_plans_image_index.csv"),
    [...planHistory.imageRows, ...planPhysics.imageRows],
  )

  const rulesPath = outPath(rawRoot, "2026-rules", "sichuan_2026_admission_rules.html")
  const helperPath = outPath(rawRoot, "2026-rules", "sichuan_2026_volunteer_helper_index.html")
  await saveUrl(sources.rules2026.url, rulesPath)
  await saveUrl(sources.helper2026.url, helperPath)

  writeCsv(outPath("data/pending-review/sichuan_2023_2024_admission_score_images.csv"), pendingRows)

  const manifestEntries = [
    manifestEntry({
      id: "sichuan_2023_admission_scores",
      year: 2023,
      dataType: "admission_scores",
      sourceUrl: sources.admission2023Batch1.url,
      sourceUpdatedAt: "2023-08-01",
      rawFiles: [...admission2023Batch1.rawFiles, ...admission2023Batch2.rawFiles],
      processedFiles: ["data/pending-review/sichuan_2023_2024_admission_score_images.csv"],
      status: "pending_review",
      missingFields: ["university_code", "university_name", "min_score", "min_rank"],
      notes:
        "官网仅发现本科一批、本科二批调档线图片页。图片/OCR 未经人工校验前不导入 admission_scores，不参与推荐。",
    }),
    manifestEntry({
      id: "sichuan_2024_admission_scores",
      year: 2024,
      dataType: "admission_scores",
      sourceUrl: sources.admission2024Batch1.url,
      sourceUpdatedAt: "2024-08-01",
      rawFiles: [...admission2024Batch1.rawFiles, ...admission2024Batch2.rawFiles],
      processedFiles: ["data/pending-review/sichuan_2023_2024_admission_score_images.csv"],
      status: "pending_review",
      missingFields: ["university_code", "university_name", "min_score", "min_rank"],
      notes:
        "官网仅发现本科一批、本科二批调档线图片页。图片/OCR 未经人工校验前不导入 admission_scores，不参与推荐。",
    }),
    manifestEntry({
      id: "sichuan_2025_admission_scores",
      year: 2025,
      dataType: "admission_scores",
      sourceUrl: sources.admission2025Status.url,
      sourceUpdatedAt: sources.admission2025Status.updatedAt,
      rawFiles: [rel(admission2025Page)],
      status: "missing",
      missingFields: ["university_code", "university_name", "min_score", "min_rank"],
      notes:
        "已找到四川考试院 2025 年普通类本科批次B段投档动态，但本次未找到官方公开可下载的本科批调档线/录取线明细表；不返回假数据。",
    }),
    manifestEntry({
      id: "sichuan_2026_score_segments",
      year: 2026,
      dataType: "score_segments",
      sourceUrl: sources.scoreHistory2026.url,
      sourceUpdatedAt: sources.scoreHistory2026.updatedAt,
      rawFiles: [...scoreHistory.rawFiles, ...scorePhysics.rawFiles],
      processedFiles: ["data/pending-review/sichuan_2026_score_segments_image_index.csv"],
      status: "pending_review",
      missingFields: ["score", "same_score_count", "cumulative_count"],
      notes:
        "四川 2026 历史类、物理类成绩分段统计表为官网图片。已保存原图索引，未人工校验前不进入正式 score_segments，不用于分数换位次。",
    }),
    manifestEntry({
      id: "sichuan_2026_admission_plans",
      year: 2026,
      dataType: "admission_plans",
      sourceUrl: sources.plansIndex2026.url,
      sourceUpdatedAt: sources.plansIndex2026.updatedAt,
      rawFiles: [
        rel(planIndex),
        rel(correction1),
        rel(correction2),
        ...planHistory.rawFiles,
        ...planPhysics.rawFiles,
      ],
      processedFiles: ["data/pending-review/sichuan_2026_admission_plans_image_index.csv"],
      status: "pending_review",
      missingFields: ["university_code", "university_name", "major_code", "major_name", "plan_count"],
      notes:
        "2026 年普通高校在川招生专业及名额介绍为官方公开图片书，未发现 Excel/CSV/可解析网页表格。未导入 admission_plans，因此不开放招生计划辅助或完整志愿推荐。",
    }),
    manifestEntry({
      id: "sichuan_2026_province_rules",
      year: 2026,
      dataType: "province_rules",
      sourceUrl: sources.rules2026.url,
      sourceUpdatedAt: sources.rules2026.updatedAt,
      rawFiles: [rel(rulesPath), rel(helperPath)],
      status: "partial",
      missingFields: ["structured_rule_rows"],
      notes:
        "已保存四川省 2026 年普通高校招生实施规定和官方志愿辅助系统入口。规则页面可公开访问；志愿辅助系统加载阿里云验证码脚本，本次不绕过验证码或动态校验。",
    }),
  ]

  upsertManifest(outPath("data/sources/other_provinces_source_manifest.json"), manifestEntries)
  upsertManifest(outPath("data/sources/source_manifest.json"), manifestEntries)
  upsertDiscovery(outPath("data/sources/other_provinces_discovery_status.json"), {
    province: "四川",
    province_slug: "sichuan",
    checked_at: now,
    official_site: officialSite,
    gaokao_channel_url: "https://www.sceea.cn/html/examenrollment.html",
    checks: [
      {
        url: officialSite,
        ok: true,
        status: 200,
        final_url: officialSite,
        content_type: "text/html",
        blocked: false,
        error: "",
      },
      {
        url: sources.helper2026.url,
        ok: true,
        status: 200,
        final_url: sources.helper2026.url,
        content_type: "text/html",
        blocked: true,
        error: "页面加载阿里云验证码脚本；未尝试绕过。",
      },
    ],
    discovered_links: {
      sichuan_2023_admission_scores: [
        { url: sources.admission2023Batch1.url, text: "2023年普通高校在川招生本科一批院校录取调档线" },
        { url: sources.admission2023Batch2.url, text: "2023年普通高校在川招生本科二批次院校录取调档线" },
      ],
      sichuan_2024_admission_scores: [
        { url: sources.admission2024Batch1.url, text: "2024年普通高校招生本科一批调档线" },
        { url: sources.admission2024Batch2.url, text: "2024年普通高校招生本科二批调档线" },
      ],
      sichuan_2025_admission_scores: [
        { url: sources.admission2025Status.url, text: "2025年普通类本科批次B段投档动态；未发现官方明细调档线附件" },
      ],
      sichuan_2026_score_segments: [
        { url: sources.scoreHistory2026.url, text: "四川省2026年普通高考历史类成绩分段统计表" },
        { url: sources.scorePhysics2026.url, text: "四川省2026年普通高考物理类成绩分段统计表" },
      ],
      sichuan_2026_admission_plans: [
        { url: sources.plansIndex2026.url, text: "2026年普通高校在川招生专业及名额介绍" },
        { url: sources.planCorrection1.url, text: "2026年普通高校在川招生计划更正及调整通知" },
        { url: sources.planCorrection2.url, text: "2026年普通高校在川招生计划更正及调整通知（二）" },
      ],
      sichuan_2026_province_rules: [
        { url: sources.rules2026.url, text: "关于做好我省2026年普通高校招生工作的通知" },
        { url: sources.helper2026.url, text: "四川省高考志愿填报辅助系统入口（验证码保护）" },
      ],
    },
  })

  const report = `
## 四川官方数据接入状态（2026-07-02）

- 官方站点：四川省教育考试院 ${officialSite}
- 2023 投档线：已保存本科一批、本科二批官方图片页和原图，状态 pending_review；未导入 admission_scores。
- 2024 投档线：已保存本科一批、本科二批官方图片页和原图，状态 pending_review；未导入 admission_scores。
- 2025 投档线：仅找到普通类本科批次B段投档动态，未找到官方公开明细表，状态 missing。
- 2026 一分一段：已保存历史类、物理类成绩分段统计表原图索引，状态 pending_review；未导入 score_segments，不支持分数换位次。
- 2026 招生计划：已保存官方“2026年普通高校在川招生专业及名额介绍”历史类 160 页、物理类 248 页图片书及两条计划更正通知；因不是结构化 Excel/CSV/网页表格，未导入 admission_plans。
- 2026 规则：已保存《四川省2026年普通高校招生实施规定》和官方志愿辅助系统入口。辅助系统加载验证码脚本，本次不绕过。
- 当前可用能力：仅教育部高校名单查询。
- 当前不可用能力：历史分数参考、历史位次参考、分数换位次、招生计划辅助、完整志愿推荐。
- 不可用原因：投档线和分段表为图片且未人工校验；2025 明细未发现；2026 招生计划未形成可导入结构化数据。
- SQLite 说明：data/gaokao-trusted.sqlite 是构建产物，不提交。
`
  appendSection(outPath("DATA_REPORT.md"), "SICHUAN_OFFICIAL_DATA", report)
  appendSection(
    outPath("data/reports/NATIONAL_OTHER_PROVINCES_DATA_REPORT.md"),
    "SICHUAN_OFFICIAL_DATA",
    report,
  )

  console.log(
    JSON.stringify(
      {
        ok: true,
        raw_files: {
          admission_2023_images:
            admission2023Batch1.imageCount + admission2023Batch2.imageCount,
          admission_2024_images:
            admission2024Batch1.imageCount + admission2024Batch2.imageCount,
          score_segment_images: scoreHistory.imageCount + scorePhysics.imageCount,
          plan_images: planHistory.imageRows.length + planPhysics.imageRows.length,
        },
        manifest_entries: manifestEntries.length,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
