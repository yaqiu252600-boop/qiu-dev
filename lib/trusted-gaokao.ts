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
  min_score: number
  min_rank?: number
  plan_type: string
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
  data_type: string
  province: string
  year: number
  source_name: string
  source_url: string
  downloaded_at: string
  source_updated_at: string
  raw_files: string[]
  processed_files: string[]
  status: "success" | "missing" | "pending_review" | "failed"
  row_count: number
  notes: string
}

export type RecommendationBucket = "rush" | "stable" | "safe"

export type TrustedRecommendation = TrustedAdmissionScore & {
  bucket: RecommendationBucket
  score_gap?: number
  rank_gap?: number
}

const root = process.cwd()

function dataPath(...parts: string[]) {
  return path.join(root, "data", ...parts)
}

function listCsvFiles(dir: string) {
  if (!fs.existsSync(dir)) {
    return []
  }

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".csv"))
    .map((file) => path.join(dir, file))
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

  return value
}

function sameProvince(left: string, right: string) {
  return normalizeProvince(left) === normalizeProvince(right)
}

export function getTrustedUniversities() {
  return readCsv(dataPath("processed", "universities", "moe_universities_2026.csv")) as TrustedUniversity[]
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
      min_score: Number(row.min_score),
      min_rank: toNumber(row.min_rank),
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
  const filePath = dataPath("sources", "source_manifest.json")

  if (!fs.existsSync(filePath)) {
    return []
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8")) as SourceManifestEntry[]
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
        const haystack = `${university.name} ${university.school_code} ${university.city}`.toLowerCase()

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
  const exact = rows.find((row) => row.score === params.score)

  if (!exact) {
    return null
  }

  return exact
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

    if (params.batch_name && score.batch_name !== params.batch_name) {
      return false
    }

    if (params.university_code && score.university_code !== params.university_code) {
      return false
    }

    if (keyword) {
      const haystack = `${score.university_code} ${score.university_name} ${score.major_group_code} ${score.major_name}`.toLowerCase()

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
      message: "暂无可信投档线数据，不能生成院校推荐。",
      warnings: ["推荐结果只允许基于 admission_scores 表，当前筛选条件下没有可用记录。"],
      recommendations: { rush: [], stable: [], safe: [] },
    }
  }

  const plans = getTrustedAdmissionPlans().filter(
    (plan) =>
      sameProvince(plan.province, params.province) &&
      plan.year === params.year &&
      normalizeSubjectType(plan.subject_type) === normalizeSubjectType(params.subject_type),
  )
  const hasPlanData = plans.length > 0
  const warnings = []
  const hasMinRank = admissionScores.some((score) => typeof score.min_rank === "number")

  if (!hasPlanData) {
    warnings.push("当前未导入当年官方招生计划，本结果仅基于历史投档线辅助参考，不能代表今年实际可报专业。")
  }

  if (params.rank && !hasMinRank) {
    warnings.push("当前投档线数据缺少最低位次，已保留用户位次但无法按位次差排序，只能按最低分差辅助筛选。")
  }

  const recommendations = { rush: [] as TrustedRecommendation[], stable: [] as TrustedRecommendation[], safe: [] as TrustedRecommendation[] }

  for (const item of admissionScores) {
    const scoreGap = item.min_score - params.score
    const rankGap =
      params.rank && typeof item.min_rank === "number"
        ? params.rank - item.min_rank
        : undefined
    const bucket =
      typeof rankGap === "number" ? bucketByRank(rankGap) : bucketByScore(scoreGap)

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
        const leftRank = typeof left.rank_gap === "number" ? Math.abs(left.rank_gap) : Math.abs(left.score_gap ?? 0)
        const rightRank = typeof right.rank_gap === "number" ? Math.abs(right.rank_gap) : Math.abs(right.score_gap ?? 0)
        return leftRank - rightRank
      })
      .slice(0, 30)
  }

  return {
    ok: true,
    message: "推荐结果已生成。所有院校记录均来自 admission_scores 表。",
    warnings,
    recommendations,
  }
}
