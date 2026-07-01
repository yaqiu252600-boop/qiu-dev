import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const now = () => new Date().toISOString()

const allowedStatuses = [
  "verified",
  "imported",
  "pending_review",
  "partial",
  "missing",
  "blocked",
  "failed",
]

const firstBatch = ["浙江", "山东", "河南", "广东", "四川", "湖北", "湖南", "安徽", "河北"]
const secondBatch = ["北京", "上海", "天津", "重庆", "福建", "江西", "辽宁", "陕西", "广西", "云南"]

const provinces = [
  province("北京", "beijing", "北京教育考试院", "https://www.bjeea.cn/", "https://www.bjeea.cn/html/gkgz/", 2),
  province("天津", "tianjin", "天津市教育招生考试院 / 招考资讯网", "https://www.zhaokao.net/", "https://www.zhaokao.net/gaokao", 2),
  province("河北", "hebei", "河北省教育考试院", "https://www.hebeea.edu.cn/", "https://www.hebeea.edu.cn/html/ptgk/", 1),
  province("山西", "shanxi", "山西省招生考试管理中心", "https://www.sxkszx.cn/", "https://www.sxkszx.cn/news/ptgk/index.html", 3),
  province("内蒙古", "inner-mongolia", "内蒙古自治区教育招生考试中心", "https://www.nm.zsks.cn/", "https://www.nm.zsks.cn/kszs/ptgk/", 3),
  province("辽宁", "liaoning", "辽宁招生考试之窗", "https://www.lnzsks.com/", "https://www.lnzsks.com/ptgk.html", 2),
  province("吉林", "jilin", "吉林省教育考试院", "http://www.jleea.edu.cn/", "http://www.jleea.edu.cn/ptgxzs/", 3),
  province("黑龙江", "heilongjiang", "黑龙江省招生考试信息港", "https://www.lzk.hl.cn/", "https://www.lzk.hl.cn/gkpd/", 3),
  province("上海", "shanghai", "上海市教育考试院 / 上海招考热线", "https://www.shmeea.edu.cn/", "https://www.shmeea.edu.cn/page/08000/index.html", 2),
  province("浙江", "zhejiang", "浙江省教育考试院", "https://www.zjzs.net/", "https://www.zjzs.net/", 1),
  province("安徽", "anhui", "安徽省教育招生考试院", "https://www.ahzsks.cn/", "https://www.ahzsks.cn/ptgxzs/", 1),
  province("福建", "fujian", "福建省教育考试院", "https://www.eeafj.cn/", "https://www.eeafj.cn/gkgsgg/", 2),
  province("江西", "jiangxi", "江西省教育考试院", "http://www.jxeea.cn/", "http://www.jxeea.cn/col/col26671/index.html", 2),
  province("山东", "shandong", "山东省教育招生考试院", "https://www.sdzk.cn/", "https://www.sdzk.cn/NewsList.aspx?BCID=4", 1),
  province("河南", "henan", "河南省教育考试院", "https://www.haeea.cn/", "https://www.haeea.cn/", 1),
  province("湖北", "hubei", "湖北省教育考试院", "http://www.hbea.edu.cn/", "http://www.hbea.edu.cn/html/ptgk/", 1),
  province("湖南", "hunan", "湖南省教育考试院 / 湖南招生考试信息港", "https://www.hneeb.cn/", "https://www.hneeb.cn/hnxxg/741/index.htm", 1),
  province("广东", "guangdong", "广东省教育考试院", "https://eea.gd.gov.cn/", "https://eea.gd.gov.cn/ptgk/", 1),
  province("广西", "guangxi", "广西壮族自治区招生考试院", "https://www.gxeea.cn/", "https://www.gxeea.cn/ptgk/", 2),
  province("海南", "hainan", "海南省考试局", "http://ea.hainan.gov.cn/", "http://ea.hainan.gov.cn/ywdt/ptgkyjszsb/", 3),
  province("重庆", "chongqing", "重庆市教育考试院", "https://www.cqksy.cn/", "https://www.cqksy.cn/site/ShowClassArticleList.jsp?ClassID=287", 2),
  province("四川", "sichuan", "四川省教育考试院", "https://www.sceea.cn/", "https://www.sceea.cn/List/NewsList_30.html", 1),
  province("贵州", "guizhou", "贵州省招生考试院", "http://zsksy.guizhou.gov.cn/", "http://zsksy.guizhou.gov.cn/ptgk/", 3),
  province("云南", "yunnan", "云南省招生考试院", "https://www.ynzs.cn/", "https://www.ynzs.cn/html/web/gaokao/", 2),
  province("西藏", "tibet", "西藏自治区教育考试院", "http://zsks.edu.xizang.gov.cn/", "http://zsks.edu.xizang.gov.cn/ptgk/", 3),
  province("陕西", "shaanxi", "陕西省教育考试院", "https://www.sneea.cn/", "https://www.sneea.cn/ptgk.htm", 2),
  province("甘肃", "gansu", "甘肃省教育考试院", "https://www.ganseea.cn/", "https://www.ganseea.cn/html/ptgk/", 3),
  province("青海", "qinghai", "青海省教育考试网", "http://www.qhjyks.com/", "http://www.qhjyks.com/zyym/ptgk.htm", 3),
  province("宁夏", "ningxia", "宁夏教育考试院", "https://www.nxjyks.cn/", "https://www.nxjyks.cn/contents/PTGK/", 3),
  province("新疆", "xinjiang", "新疆招生网", "https://www.xjzk.gov.cn/", "https://www.xjzk.gov.cn/gnq/ptgk/", 3),
]

function province(provinceName, provinceSlug, examAuthorityName, officialSite, gaokaoChannelUrl, priorityBatch) {
  return {
    province: provinceName,
    province_slug: provinceSlug,
    exam_authority_name: examAuthorityName,
    official_site: officialSite,
    gaokao_channel_url: gaokaoChannelUrl,
    search_keywords: [
      `${provinceName} 2026 一分一段表`,
      `${provinceName} 2026 普通高考 一分一段`,
      `${provinceName} 2025 普通类 本科批 投档线`,
      `${provinceName} 2024 普通类 本科批 投档线`,
      `${provinceName} 2023 普通类 本科批 投档线`,
      `${provinceName} 2026 普通高校招生计划`,
      `${provinceName} 2026 志愿填报 时间`,
    ],
    priority_batch: priorityBatch,
    status: "todo",
    notes: "本配置排除江苏；仅使用官方或权威公开来源。",
  }
}

function parseArgs() {
  const args = {}

  for (const raw of process.argv.slice(2)) {
    if (!raw.startsWith("--")) {
      continue
    }

    const [key, ...rest] = raw.slice(2).split("=")
    args[key] = rest.length ? rest.join("=") : true
  }

  return args
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8")
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    return fallback
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"))
}

function dataPath(...parts) {
  return path.join(root, "data", ...parts)
}

function ensureDataDirs() {
  for (const item of provinces) {
    ensureDir(dataPath("raw", "provinces", item.province_slug))
  }

  for (const dir of [
    ["processed", "score-segments"],
    ["processed", "admission-scores"],
    ["processed", "admission-plans"],
    ["processed", "province-rules"],
    ["pending-review"],
    ["rejected"],
    ["sources"],
    ["reports"],
    ["config"],
  ]) {
    ensureDir(dataPath(...dir))
  }
}

function writeProvinceConfig(statusByProvince = {}) {
  const filePath = dataPath("config", "provinces.json")
  const existing = readJson(filePath, [])
  const existingJiangsu = Array.isArray(existing)
    ? existing.filter((item) => item?.province === "江苏")
    : []
  const next = provinces.map((item) => ({
    ...item,
    status: statusByProvince[item.province]?.status ?? item.status,
    notes: statusByProvince[item.province]?.notes ?? item.notes,
  }))

  writeJson(filePath, [...existingJiangsu, ...next])
  return next
}

async function fetchText(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)

  try {
    const response = await fetch(url, {
      headers: {
        "user-agent":
          "qiu-dev-gaokao-data-discovery/1.0 (+official public data status check)",
      },
      redirect: "follow",
      signal: controller.signal,
    })
    const contentType = response.headers.get("content-type") ?? ""
    const text = contentType.includes("text") || contentType.includes("html")
      ? await response.text()
      : ""

    return {
      ok: response.ok,
      status: response.status,
      final_url: response.url,
      content_type: contentType,
      text,
      blocked: isBlocked(response.status, text),
      error: "",
    }
  } catch (error) {
    return {
      ok: false,
      status: 0,
      final_url: url,
      content_type: "",
      text: "",
      blocked: false,
      error: error instanceof Error ? error.message : String(error),
    }
  } finally {
    clearTimeout(timeout)
  }
}

function isBlocked(status, text) {
  if ([401, 403, 407, 429].includes(status)) {
    return true
  }

  return /验证码|登录|会员|付费|动态口令|访问受限|forbidden|captcha/i.test(text)
}

function extractLinks(baseUrl, html) {
  const links = []
  const anchorPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  let match

  while ((match = anchorPattern.exec(html)) !== null) {
    const href = match[1]?.trim()
    if (!href || href.startsWith("javascript:") || href.startsWith("#")) {
      continue
    }

    try {
      const url = new URL(href, baseUrl).toString()
      const text = match[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
      links.push({ url, text })
    } catch {
      // Ignore malformed relative links from official pages.
    }
  }

  return links
}

function targetDefinitions(year) {
  return [
    {
      data_type: "score_segments",
      year,
      terms: ["一分一段", "逐分段", "分段统计", "成绩分段"],
      missing_fields: ["score", "same_score_count", "cumulative_count"],
    },
    ...[2023, 2024, 2025].map((itemYear) => ({
      data_type: "admission_scores",
      year: itemYear,
      terms: ["投档线", "投档分数线", "投档最低分", "平行志愿投档"],
      missing_fields: ["university_code", "university_name", "min_score", "min_rank"],
    })),
    {
      data_type: "admission_plans",
      year,
      terms: ["招生计划", "招生专业目录", "分专业招生", "专业目录"],
      missing_fields: ["university_code", "university_name", "major_name", "plan_count"],
    },
    {
      data_type: "province_rules",
      year,
      terms: ["志愿填报", "志愿设置", "工作规定", "平行志愿"],
      missing_fields: ["volunteer_mode", "fill_time_start", "fill_time_end"],
    },
  ]
}

function sameHost(url, officialSite) {
  try {
    return new URL(url).hostname.replace(/^www\./, "") ===
      new URL(officialSite).hostname.replace(/^www\./, "")
  } catch {
    return false
  }
}

function matchTargetLinks(provinceConfig, target, links) {
  return links.filter((link) => {
    const haystack = `${link.text} ${decodeURIComponent(link.url)}`.toLowerCase()
    const yearMatch = haystack.includes(String(target.year))
    const termMatch = target.terms.some((term) => haystack.includes(term.toLowerCase()))
    const officialHost =
      sameHost(link.url, provinceConfig.official_site) ||
      sameHost(link.url, provinceConfig.gaokao_channel_url)

    return yearMatch && termMatch && officialHost
  })
}

function isDownloadUrl(url) {
  return /\.(pdf|xls|xlsx|csv|zip)(\?|#|$)/i.test(url)
}

function sourceId(provinceConfig, target) {
  return `${provinceConfig.province_slug}_${target.year}_${target.data_type}`
}

function manifestEntry(provinceConfig, target, status, details) {
  const totalRows = details.total_rows ?? 0
  const importedRows = details.imported_rows ?? 0
  const rawFiles = details.raw_files ?? []
  const processedFiles = details.processed_files ?? []

  return {
    id: sourceId(provinceConfig, target),
    province: provinceConfig.province,
    year: target.year,
    data_type: target.data_type,
    source_name: provinceConfig.exam_authority_name,
    source_url: details.source_url || provinceConfig.gaokao_channel_url || provinceConfig.official_site,
    source_updated_at: details.source_updated_at || "unknown",
    downloaded_at: details.downloaded_at || now(),
    raw_file_path: rawFiles[0] ?? "",
    processed_file_path: processedFiles[0] ?? "",
    raw_files: rawFiles,
    processed_files: processedFiles,
    total_rows: totalRows,
    imported_rows: importedRows,
    row_count: importedRows,
    status,
    missing_fields: details.missing_fields ?? target.missing_fields,
    queryable: false,
    usable_for_score_reference: false,
    usable_for_rank_recommendation: false,
    usable_for_admission_plan_recommendation: false,
    notes: details.notes,
  }
}

async function fetchProvince(provinceConfig, year) {
  if (provinceConfig.province === "江苏") {
    throw new Error("江苏由独立任务处理；本脚本默认禁止处理江苏。")
  }

  const checks = []
  const allLinks = []

  for (const url of [provinceConfig.official_site, provinceConfig.gaokao_channel_url]) {
    if (!url) {
      continue
    }

    const result = await fetchText(url)
    checks.push({
      url,
      ok: result.ok,
      status: result.status,
      final_url: result.final_url,
      content_type: result.content_type,
      blocked: result.blocked,
      error: result.error,
    })

    if (result.text) {
      allLinks.push(...extractLinks(result.final_url, result.text))
    }
  }

  const targets = targetDefinitions(year)
  const entries = []
  const discovered_links = {}
  const blocked = checks.some((check) => check.blocked)
  const failedAll = checks.length > 0 && checks.every((check) => !check.ok)

  for (const target of targets) {
    const matches = matchTargetLinks(provinceConfig, target, allLinks).slice(0, 10)
    const downloads = matches.filter((link) => isDownloadUrl(link.url))
    discovered_links[sourceId(provinceConfig, target)] = matches

    if (blocked) {
      entries.push(
        manifestEntry(provinceConfig, target, "blocked", {
          notes: "官方站点访问出现登录、验证码、频率限制或访问受限提示，未尝试绕过。",
          source_url: checks.find((check) => check.blocked)?.url,
        }),
      )
      continue
    }

    if (matches.length > 0) {
      entries.push(
        manifestEntry(provinceConfig, target, downloads.length > 0 ? "pending_review" : "partial", {
          notes:
            downloads.length > 0
              ? "已在官方页面发现疑似可下载公开文件链接；原始文件需单独下载和人工校验后才能导入。"
              : "已在官方页面发现疑似相关公告链接；尚未形成可查询结构化数据。",
          source_url: matches[0].url,
        }),
      )
      continue
    }

    entries.push(
      manifestEntry(provinceConfig, target, failedAll ? "failed" : "missing", {
        notes: failedAll
          ? "本次无法访问官方站点或高考栏目，未获取到可信数据。"
          : "本次在官方站点首页/高考栏目未发现可直接确认的数据文件；不会使用非官方来源或推测补全。",
        source_url: provinceConfig.gaokao_channel_url || provinceConfig.official_site,
      }),
    )
  }

  return {
    province: provinceConfig.province,
    province_slug: provinceConfig.province_slug,
    checked_at: now(),
    official_site: provinceConfig.official_site,
    gaokao_channel_url: provinceConfig.gaokao_channel_url,
    checks,
    discovered_links,
    entries,
  }
}

function mergeOtherProvinceManifest(entries) {
  const filePath = dataPath("sources", "other_provinces_source_manifest.json")
  const byId = new Map()

  for (const entry of readJson(filePath, [])) {
    if (entry?.province !== "江苏") {
      byId.set(entry.id ?? `${entry.province}-${entry.year}-${entry.data_type}`, entry)
    }
  }

  for (const entry of entries) {
    if (!allowedStatuses.includes(entry.status)) {
      throw new Error(`非法数据状态：${entry.status}`)
    }

    byId.set(entry.id, entry)
  }

  writeJson(filePath, [...byId.values()].sort((left, right) => {
    const provinceOrder = provinces.findIndex((item) => item.province === left.province) -
      provinces.findIndex((item) => item.province === right.province)

    if (provinceOrder !== 0) {
      return provinceOrder
    }

    return `${left.data_type}-${left.year}`.localeCompare(`${right.data_type}-${right.year}`)
  }))
}

function mergeDiscoveryStatus(results) {
  const filePath = dataPath("sources", "other_provinces_discovery_status.json")
  const byProvince = new Map(readJson(filePath, []).map((item) => [item.province, item]))

  for (const result of results) {
    byProvince.set(result.province, {
      province: result.province,
      province_slug: result.province_slug,
      checked_at: result.checked_at,
      official_site: result.official_site,
      gaokao_channel_url: result.gaokao_channel_url,
      checks: result.checks,
      discovered_links: result.discovered_links,
    })
  }

  writeJson(filePath, [...byProvince.values()].sort((left, right) => {
    return provinces.findIndex((item) => item.province === left.province) -
      provinces.findIndex((item) => item.province === right.province)
  }))
}

function getBatch(batch) {
  if (batch === 1) {
    return firstBatch
  }

  if (batch === 2) {
    return secondBatch
  }

  return provinces
    .filter((item) => item.priority_batch === 3)
    .map((item) => item.province)
}

function selectProvinces(args) {
  if (args.province) {
    if (args.province === "江苏" && !args["allow-jiangsu"]) {
      throw new Error("江苏由独立任务处理；如确需处理必须显式传入 --allow-jiangsu。")
    }

    return provinces.filter((item) => item.province === args.province || item.province_slug === args.province)
  }

  if (args.batch) {
    const batch = Number(args.batch)
    const names = new Set(getBatch(batch))
    return provinces.filter((item) => names.has(item.province))
  }

  return provinces
}

function groupSourcesByProvince(sources) {
  const map = new Map()

  for (const item of sources) {
    const group = map.get(item.province) ?? []
    group.push(item)
    map.set(item.province, group)
  }

  return map
}

function sourceStatus(sources, provinceName, dataType, year) {
  return sources.find(
    (item) =>
      item.province === provinceName &&
      item.data_type === dataType &&
      Number(item.year) === Number(year),
  )?.status ?? "missing"
}

function generateReport() {
  const config = readJson(dataPath("config", "provinces.json"), provinces)
    .filter((item) => item.province !== "江苏")
  const sources = readJson(dataPath("sources", "other_provinces_source_manifest.json"), [])
  const statusByProvince = groupSourcesByProvince(sources)
  const lines = []

  lines.push("# 全国非江苏省份高考数据接入报告")
  lines.push("")
  lines.push(`生成时间：${now()}`)
  lines.push("")
  lines.push("## 本次边界")
  lines.push("")
  lines.push("- 本次处理明确排除了江苏；江苏数据由独立任务处理，本报告不覆盖江苏配置、原始文件、清洗文件或导入结果。")
  lines.push("- 本次目标是官方源发现、状态登记、可下载公开数据线索识别，以及 missing/blocked/failed 标记，不强行一次性导入全国数据。")
  lines.push("- 未找到公开可信数据时只记录状态，不使用系统补全学校、专业、分数线、位次或招生计划。")
  lines.push("")
  lines.push("## provinces.json 覆盖省份")
  lines.push("")
  lines.push(config.map((item) => item.province).join("、"))
  lines.push("")
  lines.push("## 第一批官方站点发现结果")
  lines.push("")
  lines.push("| 省份 | 官方机构 | 官方站点 | 高考栏目 | 当前状态 |")
  lines.push("| --- | --- | --- | --- | --- |")
  for (const item of config.filter((row) => row.priority_batch === 1)) {
    const statuses = statusByProvince.get(item.province) ?? []
    const hasBlocked = statuses.some((source) => source.status === "blocked")
    const hasFailed = statuses.some((source) => source.status === "failed")
    const state = hasBlocked ? "blocked" : hasFailed ? "failed" : statuses.length ? "checked" : "todo"
    lines.push(`| ${item.province} | ${item.exam_authority_name} | ${item.official_site} | ${item.gaokao_channel_url} | ${state} |`)
  }

  lines.push("")
  lines.push("## 分省数据状态")
  lines.push("")
  lines.push("| 省份 | 一分一段 2026 | 投档线 2023 | 投档线 2024 | 投档线 2025 | 招生计划 2026 | 志愿规则 2026 | 当前支持能力 |")
  lines.push("| --- | --- | --- | --- | --- | --- | --- | --- |")

  for (const item of config) {
    const scoreSegments = sourceStatus(sources, item.province, "score_segments", 2026)
    const score2023 = sourceStatus(sources, item.province, "admission_scores", 2023)
    const score2024 = sourceStatus(sources, item.province, "admission_scores", 2024)
    const score2025 = sourceStatus(sources, item.province, "admission_scores", 2025)
    const plans = sourceStatus(sources, item.province, "admission_plans", 2026)
    const rules = sourceStatus(sources, item.province, "province_rules", 2026)
    lines.push(
      `| ${item.province} | ${scoreSegments} | ${score2023} | ${score2024} | ${score2025} | ${plans} | ${rules} | 仅院校查询 |`,
    )
  }

  for (const status of ["verified", "imported", "pending_review", "partial", "missing", "blocked", "failed"]) {
    lines.push("")
    lines.push(`## ${status} 数据`)
    lines.push("")
    const matched = sources.filter((item) => item.status === status)
    if (matched.length === 0) {
      lines.push("- 无")
      continue
    }

    for (const item of matched) {
      lines.push(`- ${item.province} / ${item.year} / ${item.data_type} / ${item.source_name} / ${item.source_url}`)
    }
  }

  lines.push("")
  lines.push("## 下一步建议")
  lines.push("")
  lines.push("- 优先继续第一批省份：浙江、山东、河南、广东、四川、湖北、湖南、安徽、河北。")
  lines.push("- 对第一批省份逐个进入考试院站内高考栏目和公告列表，优先找 Excel、CSV 或网页表格；PDF 只能先保留原文件并进入人工校验。")
  lines.push("- 招生计划如果只有总量公告或需要纸质书、登录、验证码、付费渠道，应继续标记 missing 或 blocked，不进入 admission_plans。")
  lines.push("- 等某省同时具备 verified 一分一段、含 min_rank 的 admission_scores、当年 admission_plans 后，再开放完整志愿辅助分析。")

  const filePath = dataPath("reports", "NATIONAL_OTHER_PROVINCES_DATA_REPORT.md")
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8")
}

function importVerifiedData() {
  const sources = [
    ...readJson(dataPath("sources", "source_manifest.json"), []),
    ...readJson(dataPath("sources", "other_provinces_source_manifest.json"), []),
  ]
  const importable = sources.filter((item) => ["verified", "imported"].includes(item.status))

  console.log(JSON.stringify({
    ok: true,
    message: "仅确认 verified/imported 数据可参与导入；missing、blocked、partial、pending_review 不会被导入。",
    importable_count: importable.length,
    importable: importable.map((item) => ({
      province: item.province,
      year: item.year,
      data_type: item.data_type,
      status: item.status,
      processed_files: item.processed_files ?? [],
    })),
  }, null, 2))
}

async function main() {
  const args = parseArgs()
  const mode = args.mode ?? "discover"
  const year = Number(args.year ?? 2026)

  ensureDataDirs()

  if (mode === "discover") {
    writeProvinceConfig()
    console.log(JSON.stringify({ ok: true, provinces: provinces.length, excludes: "江苏" }, null, 2))
    return
  }

  if (mode === "fetch") {
    const selected = selectProvinces(args)
    if (selected.length === 0) {
      throw new Error(`未找到省份：${args.province ?? args.batch}`)
    }

    const results = []
    const entries = []
    const statusByProvince = {}

    for (const item of selected) {
      const result = await fetchProvince(item, year)
      results.push(result)
      entries.push(...result.entries)
      const anyOk = result.checks.some((check) => check.ok)
      const anyBlocked = result.checks.some((check) => check.blocked)
      statusByProvince[item.province] = {
        status: anyBlocked ? "blocked" : anyOk ? "checked" : "failed",
        notes: anyBlocked
          ? "官方站点访问受限，本脚本未绕过限制。"
          : anyOk
            ? "已完成官方站点/高考栏目公开页面探测。"
            : "本次探测未能访问官方站点。",
      }
    }

    mergeDiscoveryStatus(results)
    mergeOtherProvinceManifest(entries)
    writeProvinceConfig(statusByProvince)
    generateReport()

    console.log(JSON.stringify({
      ok: true,
      excludes: "江苏",
      checked_provinces: selected.map((item) => item.province),
      generated_entries: entries.length,
    }, null, 2))
    return
  }

  if (mode === "report") {
    writeProvinceConfig()
    generateReport()
    console.log(JSON.stringify({ ok: true, report: "data/reports/NATIONAL_OTHER_PROVINCES_DATA_REPORT.md" }, null, 2))
    return
  }

  if (mode === "import") {
    importVerifiedData()
    return
  }

  throw new Error(`未知 mode：${mode}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
