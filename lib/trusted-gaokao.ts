import fs from "fs"
import path from "path"

export type TrustedUniversity = {
  id: string
  name: string
  school_code: string
  province: string
  city: string
  authority: string
  education_level: string
  school_type: string
  ownership: string
  remark: string
  source_name: string
  source_url: string
  source_updated_at: string
  created_at: string
  updated_at: string
}

export type TrustedScoreSegment = {
  id: string
  year: number
  province: string
  subject_type: string
  score: number
  same_score_count?: number
  cumulative_count: number
  rank_min?: number
  rank_max?: number
  source_name: string
  source_url: string
  source_updated_at: string
  created_at: string
  updated_at: string
}

export type TrustedAdmissionScore = {
  id: string
  year: number
  province: string
  subject_type: string
  batch_name: string
  university_code: string
  university_name: string
  major_group_code: string
  major_code: string
  major_name: string
  min_score?: number
  min_rank?: number
  plan_count?: number
  plan_type: string
  status?: string
  source_name: string
  source_url: string
  source_updated_at: string
  created_at: string
  updated_at: string
}

export type TrustedAdmissionPlan = {
  id: string
  year: number
  province: string
  subject_type: string
  batch_name: string
  university_code: string
  university_name: string
  major_group_code: string
  major_code: string
  major_name: string
  plan_count?: number
  tuition: string
  duration: string
  requirements: string
  remark: string
  source_name: string
  source_url: string
  source_updated_at: string
  created_at: string
  updated_at: string
}

export type SourceManifestEntry = {
  id?: string
  data_type: string
  province: string
  year: number
  source_name: string
  source_url: string
  downloaded_at: string
  source_updated_at: string
  raw_file_path?: string
  processed_file_path?: string
  raw_files: string[]
  processed_files: string[]
  status:
    | "verified"
    | "imported"
    | "pending_review"
    | "partial"
    | "missing"
    | "blocked"
    | "failed"
  row_count?: number
  total_rows?: number
  imported_rows?: number
  missing_fields?: string[]
  queryable: boolean
  usable_for_score_reference: boolean
  usable_for_rank_recommendation: boolean
  usable_for_admission_plan_recommendation: boolean
  notes: string
}

type RawSourceManifestEntry = Omit<SourceManifestEntry, "status"> & {
  status: string
}

export type ProvinceConfig = {
  province: string
  province_slug: string
  exam_authority_name: string
  official_site: string
  gaokao_channel_url: string
  search_keywords: string[]
  priority_batch: number
  status: string
  notes: string
}

export type ProvinceDataOverview = {
  province: string
  province_slug: string
  priority_batch: number
  exam_authority_name: string
  official_site: string
  gaokao_channel_url: string
  config_status: string
  universities_status: string
  score_segments_status: SourceManifestEntry["status"] | "missing"
  admission_scores_by_year: Record<string, SourceManifestEntry["status"] | "missing">
  admission_plans_status: SourceManifestEntry["status"] | "missing"
  province_rules_status: SourceManifestEntry["status"] | "missing"
  support_capabilities: string[]
  unavailable_reasons: string[]
  sources: SourceManifestEntry[]
  handled_independently?: boolean
}

export type RecommendationBucket = "rush" | "stable" | "safe"
export type RecommendationMode = "rank_recommendation" | "score_reference"

export type TrustedRecommendation = TrustedAdmissionScore & {
  bucket: RecommendationBucket
  score_gap?: number
  rank_gap?: number
}

const root = process.cwd()

function dataPath(...parts: string[]) {
  return path.join(root, "data", ...parts)
}

function listCsvFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return []
  }

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      return listCsvFiles(filePath)
    }

    return entry.isFile() && entry.name.endsWith(".csv") ? [filePath] : []
  })
}

function parseCsvLine(line: string) {
  const cells: string[] = []
  let current = ""
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const next = line[index + 1]

    if (char === '"' && quoted && next === '"') {
      current += '"'
      index += 1
      continue
    }

    if (char === '"') {
      quoted = !quoted
      continue
    }

    if (char === "," && !quoted) {
      cells.push(current)
      current = ""
      continue
    }

    current += char
  }

  cells.push(current)
  return cells
}

function readCsv(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return []
  }

  const content = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "")
  const lines = content.split(/\r?\n/).filter((line) => line.trim())

  if (lines.length < 2) {
    return []
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.trim())

  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line)
    return Object.fromEntries(
      headers.map((header, index) => [header, cells[index]?.trim() ?? ""]),
    )
  })
}

function toNumber(value: string) {
  if (!value) {
    return undefined
  }

  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}

function normalizeProvince(province: string) {
  return province
    .trim()
    .replace(/壮族自治区|回族自治区|维吾尔自治区|自治区|省|市/g, "")
}

export function normalizeSubjectType(subjectType: string) {
  const value = subjectType.trim().toLowerCase()

  if (["history", "历史", "历史类", "历史等科目类"].includes(value)) {
    return "history"
  }

  if (["physics", "物理", "物理类", "物理等科目类"].includes(value)) {
    return "physics"
  }

  if (["general", "普通", "普通类", "综合改革"].includes(value)) {
    return "general"
  }

  return value
}

function sameProvince(left: string, right: string) {
  return normalizeProvince(left) === normalizeProvince(right)
}

function readJsonFile<T>(filePath: string, fallback: T) {
  if (!fs.existsSync(filePath)) {
    return fallback
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T
}

export function getTrustedUniversities() {
  return readCsv(
    dataPath("processed", "universities", "moe_universities_2026.csv"),
  ) as TrustedUniversity[]
}

export function getTrustedScoreSegments() {
  return listCsvFiles(dataPath("processed", "score-segments"))
    .flatMap((filePath) => readCsv(filePath))
    .map((row) => ({
      ...row,
      year: Number(row.year),
      score: Number(row.score),
      same_score_count: toNumber(row.same_score_count),
      cumulative_count: Number(row.cumulative_count),
      rank_min: toNumber(row.rank_min),
      rank_max: toNumber(row.rank_max),
    })) as TrustedScoreSegment[]
}

export function getTrustedAdmissionScores() {
  return listCsvFiles(dataPath("processed", "admission-scores"))
    .flatMap((filePath) => readCsv(filePath))
    .map((row) => ({
      ...row,
      year: Number(row.year),
      min_score: toNumber(row.min_score),
      min_rank: toNumber(row.min_rank),
      plan_count: toNumber(row.plan_count),
    })) as TrustedAdmissionScore[]
}

export function getTrustedAdmissionPlans() {
  return listCsvFiles(dataPath("processed", "admission-plans"))
    .flatMap((filePath) => readCsv(filePath))
    .map((row) => ({
      ...row,
      year: Number(row.year),
      plan_count: toNumber(row.plan_count),
    })) as TrustedAdmissionPlan[]
}

export function getSourceManifest() {
  const primary = readJsonFile<RawSourceManifestEntry[]>(
    dataPath("sources", "source_manifest.json"),
    [],
  )
  const otherProvinces = readJsonFile<RawSourceManifestEntry[]>(
    dataPath("sources", "other_provinces_source_manifest.json"),
    [],
  )

  const byKey = new Map<string, RawSourceManifestEntry>()

  for (const entry of [...otherProvinces, ...primary]) {
    const key =
      entry.id ??
      [
        entry.province,
        entry.year,
        entry.data_type,
        entry.source_url,
      ].join("|")
    byKey.set(key, entry)
  }

  return [...byKey.values()].map((entry) => ({
    ...entry,
    status: entry.status === "success" ? "verified" : entry.status,
    raw_files: entry.raw_files ?? [],
    processed_files: entry.processed_files ?? [],
    queryable: Boolean(entry.queryable),
    usable_for_score_reference: Boolean(entry.usable_for_score_reference),
    usable_for_rank_recommendation: Boolean(entry.usable_for_rank_recommendation),
    usable_for_admission_plan_recommendation: Boolean(
      entry.usable_for_admission_plan_recommendation,
    ),
  })) as SourceManifestEntry[]
}

const jiangsuConfig: ProvinceConfig = {
  province: "江苏",
  province_slug: "jiangsu",
  exam_authority_name: "江苏省教育考试院",
  official_site: "https://www.jseea.cn/",
  gaokao_channel_url: "https://www.jseea.cn/",
  search_keywords: [],
  priority_batch: 0,
  status: "handled_independently",
  notes: "江苏由独立任务处理中；本轮全国扩展不覆盖江苏数据。",
}

export function getProvinceConfigs() {
  const configs = readJsonFile<ProvinceConfig[]>(
    dataPath("config", "provinces.json"),
    [],
  ).filter((item) => item.province !== "江苏")

  return [jiangsuConfig, ...configs]
}

function statusFor(
  sources: SourceManifestEntry[],
  province: string,
  dataType: string,
  year: number,
) {
  return (
    sources.find(
      (source) =>
        sameProvince(source.province, province) &&
        source.data_type === dataType &&
        Number(source.year) === year,
    )?.status ?? "missing"
  )
}

function sourcesForProvince(sources: SourceManifestEntry[], province: string) {
  return sources.filter((source) => sameProvince(source.province, province))
}

function sourceIsUsable(source?: SourceManifestEntry) {
  return Boolean(
    source &&
      ["verified", "imported"].includes(source.status) &&
      (source.queryable || source.usable_for_score_reference),
  )
}

function getBestAdmissionScoreSource(
  sources: SourceManifestEntry[],
  province: string,
) {
  return sources.find(
    (source) =>
      sameProvince(source.province, province) &&
      source.data_type === "admission_scores" &&
      sourceIsUsable(source),
  )
}

export function getProvinceDataOverview() {
  const configs = getProvinceConfigs()
  const sources = getSourceManifest()
  const universitiesVerified = sources.some(
    (source) =>
      source.province === "全国" &&
      source.data_type === "universities" &&
      ["verified", "imported"].includes(source.status),
  )

  return configs.map((config) => {
    const provinceSources = sourcesForProvince(sources, config.province)
    const bestAdmissionScore = getBestAdmissionScoreSource(
      sources,
      config.province,
    )
    const scoreSegmentsStatus = statusFor(
      sources,
      config.province,
      "score_segments",
      2026,
    )
    const admissionPlansStatus = statusFor(
      sources,
      config.province,
      "admission_plans",
      2026,
    )
    const provinceRulesStatus = statusFor(
      sources,
      config.province,
      "province_rules",
      2026,
    )
    const admissionScoresByYear = {
      "2023": statusFor(sources, config.province, "admission_scores", 2023),
      "2024": statusFor(sources, config.province, "admission_scores", 2024),
      "2025": statusFor(sources, config.province, "admission_scores", 2025),
    }
    const supportCapabilities = ["仅院校查询"]
    const unavailableReasons: string[] = []

    if (bestAdmissionScore) {
      supportCapabilities.push("可查投档线")
    } else {
      unavailableReasons.push("当前暂未导入该省可信历史投档线，无法生成推荐。")
    }

    if (provinceSources.some((source) => source.usable_for_score_reference)) {
      supportCapabilities.push("可做分数参考")
    }

    if (provinceSources.some((source) => source.usable_for_rank_recommendation)) {
      supportCapabilities.push("可做位次参考")
    } else {
      unavailableReasons.push(
        "当前该省投档线数据未包含最低位次，暂不能基于位次生成冲稳保分析。",
      )
    }

    if (
      provinceSources.some(
        (source) =>
          source.data_type === "score_segments" &&
          source.status === "verified",
      )
    ) {
      supportCapabilities.push("可做可信位次换算")
    } else {
      unavailableReasons.push(
        "暂无已校验的一分一段数据，无法进行可信位次换算。",
      )
    }

    if (
      provinceSources.some(
        (source) =>
          source.data_type === "admission_plans" &&
          ["verified", "imported"].includes(source.status),
      )
    ) {
      supportCapabilities.push("可做招生计划辅助")
    } else {
      unavailableReasons.push(
        "当前未导入该省当年官方招生计划，本结果不能代表今年实际可报专业、专业组或招生人数。",
      )
    }

    if (
      scoreSegmentsStatus === "verified" &&
      provinceSources.some((source) => source.usable_for_rank_recommendation) &&
      ["verified", "imported"].includes(admissionPlansStatus)
    ) {
      supportCapabilities.push("可做完整志愿辅助分析")
    }

    return {
      province: config.province,
      province_slug: config.province_slug,
      priority_batch: config.priority_batch,
      exam_authority_name: config.exam_authority_name,
      official_site: config.official_site,
      gaokao_channel_url: config.gaokao_channel_url,
      config_status: config.status,
      universities_status: universitiesVerified ? "全国可用" : "missing",
      score_segments_status: scoreSegmentsStatus,
      admission_scores_by_year: admissionScoresByYear,
      admission_plans_status: admissionPlansStatus,
      province_rules_status: provinceRulesStatus,
      support_capabilities: supportCapabilities,
      unavailable_reasons: Array.from(new Set(unavailableReasons)),
      sources: provinceSources,
      handled_independently: config.province === "江苏",
    } satisfies ProvinceDataOverview
  })
}

export function findUniversities(params: {
  keyword?: string
  province?: string
  education_level?: string
}) {
  const keyword = params.keyword?.trim().toLowerCase()
  const province = params.province?.trim()
  const educationLevel = params.education_level?.trim()

  return getTrustedUniversities()
    .filter((university) => {
      if (keyword) {
        const haystack =
          `${university.name} ${university.school_code} ${university.city}`.toLowerCase()

        if (!haystack.includes(keyword)) {
          return false
        }
      }

      if (province && !sameProvince(university.province, province)) {
        return false
      }

      if (educationLevel && university.education_level !== educationLevel) {
        return false
      }

      return true
    })
    .slice(0, 100)
}

export function findUniversityById(id: string) {
  return getTrustedUniversities().find(
    (university) => university.id === id || university.school_code === id,
  )
}

export function findScoreSegments(params: {
  province?: string
  year?: number
  subject_type?: string
}) {
  const subjectType = params.subject_type
    ? normalizeSubjectType(params.subject_type)
    : undefined

  return getTrustedScoreSegments().filter((segment) => {
    if (params.province && !sameProvince(segment.province, params.province)) {
      return false
    }

    if (params.year && segment.year !== params.year) {
      return false
    }

    if (subjectType && normalizeSubjectType(segment.subject_type) !== subjectType) {
      return false
    }

    return true
  })
}

export function rankFromScore(params: {
  province: string
  year: number
  subject_type: string
  score: number
}) {
  const rows = findScoreSegments(params)
  return rows.find((row) => row.score === params.score) ?? null
}

export function findAdmissionScores(params: {
  province?: string
  year?: number
  subject_type?: string
  batch_name?: string
  keyword?: string
  university_code?: string
}) {
  const subjectType = params.subject_type
    ? normalizeSubjectType(params.subject_type)
    : undefined
  const keyword = params.keyword?.trim().toLowerCase()
  const batchName = params.batch_name?.trim()

  return getTrustedAdmissionScores().filter((score) => {
    if (params.province && !sameProvince(score.province, params.province)) {
      return false
    }

    if (params.year && score.year !== params.year) {
      return false
    }

    if (subjectType && normalizeSubjectType(score.subject_type) !== subjectType) {
      return false
    }

    if (batchName && !score.batch_name.includes(batchName)) {
      return false
    }

    if (params.university_code && score.university_code !== params.university_code) {
      return false
    }

    if (keyword) {
      const haystack =
        `${score.university_code} ${score.university_name} ${score.major_group_code} ${score.major_name}`.toLowerCase()

      if (!haystack.includes(keyword)) {
        return false
      }
    }

    return true
  })
}

function bucketByRank(rankGap: number): RecommendationBucket | null {
  if (rankGap > 0 && rankGap <= 15000) {
    return "rush"
  }

  if (rankGap >= -10000 && rankGap <= 5000) {
    return "stable"
  }

  if (rankGap < -10000) {
    return "safe"
  }

  return null
}

function bucketByScore(scoreGap: number): RecommendationBucket | null {
  if (scoreGap >= 0 && scoreGap <= 20) {
    return "rush"
  }

  if (scoreGap >= -20 && scoreGap <= 5) {
    return "stable"
  }

  if (scoreGap < -20) {
    return "safe"
  }

  return null
}

export function recommendFromTrustedData(params: {
  province: string
  year: number
  subject_type: string
  score: number
  rank?: number
  batch_name?: string
  converted_rank_from_score?: boolean
}) {
  const admissionScores = findAdmissionScores({
    province: params.province,
    year: params.year,
    subject_type: params.subject_type,
    batch_name: params.batch_name,
  })

  if (admissionScores.length === 0) {
    return {
      ok: false,
      recommendation_mode: "score_reference" as RecommendationMode,
      message: "当前暂未导入该省可信历史投档线，无法生成推荐。",
      warnings: [
        "当前暂未导入该省可信历史投档线，无法生成推荐。",
      ],
      recommendations: { rush: [], stable: [], safe: [] },
    }
  }

  const plans = getTrustedAdmissionPlans().filter(
    (plan) =>
      sameProvince(plan.province, params.province) &&
      plan.year === params.year &&
      normalizeSubjectType(plan.subject_type) ===
        normalizeSubjectType(params.subject_type),
  )
  const hasPlanData = plans.length > 0
  const hasVerifiedScoreSegments =
    findScoreSegments({
      province: params.province,
      year: params.year,
      subject_type: params.subject_type,
    }).length > 0
  const hasMinRank = admissionScores.some(
    (score) => typeof score.min_rank === "number",
  )
  const hasMinScore = admissionScores.some(
    (score) => typeof score.min_score === "number",
  )
  const canUseRank = Boolean(params.rank && hasMinRank)
  const recommendationMode: RecommendationMode = canUseRank
    ? "rank_recommendation"
    : "score_reference"
  const warnings: string[] = []
  const recommendations = {
    rush: [] as TrustedRecommendation[],
    stable: [] as TrustedRecommendation[],
    safe: [] as TrustedRecommendation[],
  }

  if (!hasPlanData) {
    warnings.push(
      "当前未导入当年官方招生计划，本结果不能代表今年实际可报专业或招生人数。",
    )
  }

  if (!hasMinRank) {
    warnings.push(
      "当前该省投档线数据未包含最低位次，暂不能基于位次生成冲稳保分析。",
    )
  }

  if (!hasMinScore) {
    warnings.push(
      "当前该省投档线数据未包含最低分，只能在输入官方位次后查看历史投档最低位次参考。",
    )
  }

  if (!params.rank && !params.converted_rank_from_score) {
    warnings.push(
      "暂无已校验的一分一段数据，无法进行可信位次换算。",
    )
  }

  if (!canUseRank && !hasMinScore) {
    const message =
      params.province === "山东"
        ? "山东当前已导入数据未包含最低分，无法基于分数生成可信参考；请填写官方位次。"
        : "当前该省官方投档线只有最低位次，需输入官方位次后才能查看历史位次参考。"

    return {
      ok: false,
      recommendation_mode: "rank_recommendation" as RecommendationMode,
      message,
      warnings,
      recommendations,
    }
  }

  for (const item of admissionScores) {
    const scoreGap =
      typeof item.min_score === "number" ? item.min_score - params.score : undefined
    const rankGap =
      canUseRank && typeof item.min_rank === "number" && params.rank
        ? params.rank - item.min_rank
        : undefined
    const bucket =
      recommendationMode === "rank_recommendation" && typeof rankGap === "number"
        ? bucketByRank(rankGap)
        : typeof scoreGap === "number"
          ? bucketByScore(scoreGap)
          : null

    if (!bucket) {
      continue
    }

    recommendations[bucket].push({
      ...item,
      bucket,
      score_gap: scoreGap,
      rank_gap: rankGap,
    })
  }

  for (const bucket of Object.keys(recommendations) as RecommendationBucket[]) {
    recommendations[bucket] = recommendations[bucket]
      .sort((left, right) => {
        const leftDistance =
          recommendationMode === "rank_recommendation" &&
          typeof left.rank_gap === "number"
            ? Math.abs(left.rank_gap)
            : Math.abs(left.score_gap ?? 0)
        const rightDistance =
          recommendationMode === "rank_recommendation" &&
          typeof right.rank_gap === "number"
            ? Math.abs(right.rank_gap)
            : Math.abs(right.score_gap ?? 0)
        return leftDistance - rightDistance
      })
      .slice(0, 30)
  }

  return {
    ok: true,
    recommendation_mode: recommendationMode,
    message:
      recommendationMode === "rank_recommendation" && hasPlanData
        && hasVerifiedScoreSegments
        ? "完整志愿辅助分析。"
        : recommendationMode === "rank_recommendation"
          ? "已生成基于官方位次字段的历史位次参考。"
        : "已生成仅基于历史投档最低分的参考结果。",
    warnings,
    can_use_rank: canUseRank,
    has_admission_plans: hasPlanData,
    recommendations,
  }
}
