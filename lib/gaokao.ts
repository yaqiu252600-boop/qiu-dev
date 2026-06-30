import {
  getAdmissionScores,
  getEnrollmentPlans,
  getGaokaoMajors,
  getGaokaoSchools,
  getOfficialOpenDataSources,
  getProvinceRules,
  getScoreRanks,
} from "@/lib/gaokao-data"
import majorPathwaysData from "@/data/gaokao/strategy/major-pathways.json"
import riskRulesData from "@/data/gaokao/strategy/risk-rules.json"
import schoolTypeRulesData from "@/data/gaokao/strategy/school-type-rules.json"
import scoreSegmentsData from "@/data/gaokao/strategy/score-segments.json"
import type {
  AdmissionScore,
  EnrollmentPlan,
  GaokaoMajor,
  GaokaoSchool,
  GaokaoSubjectType,
  OfficialOpenDataSource,
} from "@/lib/gaokao-types"

export type SubjectType = "physics" | "history" | "comprehensive"
export type ExtendedSubjectType = SubjectType | "science" | "arts"

export type InterestKey =
  | "software"
  | "electrical-automation"
  | "intelligent-manufacturing"
  | "medical-care"
  | "teacher-education"
  | "accounting-finance"
  | "law-public-admin"
  | "rail-transit-aviation"
  | "architecture-civil"
  | "digital-media-design"
  | "agriculture-food"
  | "uncertain"

export type CurrentGoal =
  | "bachelor"
  | "stable"
  | "employment"
  | "upgrade"
  | "city"
  | "tuition"

export type TuitionTolerance = "low" | "medium" | "high"
export type AcceptanceOption = "accept" | "reject" | "conditional"
export type OutProvinceOption = "accept" | "reject" | "nearby"

export type VolunteerPreference =
  | "rush-bachelor"
  | "stable-admission"
  | "employment"
  | "upgrade"
  | "balanced"

export type RecommendationLevel = "rush" | "stable" | "safe"

export type GaokaoInput = {
  province: string
  score: number
  rank?: number
  subjectType: ExtendedSubjectType
  interest: InterestKey
  currentGoal: CurrentGoal
  tuitionTolerance: TuitionTolerance
  acceptsJuniorCollege: AcceptanceOption
  acceptsOutOfProvince: OutProvinceOption
  preference: VolunteerPreference
}

export type SchoolRecommendation = {
  id: string
  name: string
  city: string
  major: string
  level: RecommendationLevel
  reason: string
  risk: string
  suitableFor: string
  suggestion: string
  sourceName: string
  sourceUrl: string
  dataYear?: number
  isOfficialData: boolean
  isDemoData: boolean
}

export type DataCoverageStatus = {
  province: string
  hasRealAdmissionScores: boolean
  coveredYears: number[]
  hasScoreRanks: boolean
  hasEnrollmentPlans: boolean
  hasMajorAdmissionScores: boolean
  officialSources: OfficialOpenDataSource[]
  message: string
}

export type StrategyOption = {
  title: string
  description: string
  items: string[]
}

export type GaokaoPlan = {
  scorePosition: {
    title: string
    description: string
  }
  coreAdvice: string[]
  riskWarnings: string[]
  bachelorOpportunity: string
  juniorCollegePriority: string
  privateBachelorRisk: string
  upgradeRouteSuggestion: string
  tradeoffAnalysis: StrategyOption[]
  recommendedPaths: StrategyOption[]
  rushPlan: StrategyOption
  stablePlan: StrategyOption
  safePlan: StrategyOption
  majorDirectionAdvice: StrategyOption[]
  nextActions: string[]
  dataCoverage: DataCoverageStatus
  recommendations: SchoolRecommendation[]
  hasDemoData: boolean
}

type ScoreSegmentRule = {
  id: string
  minScore: number
  maxScore: number
  title: string
  positioning: string
  bachelorOpportunity: string
  juniorCollegePriority: string
  privateBachelorRisk: string
  upgradeRoute: string
  coreAdvice: string[]
  riskWarnings: string[]
  rushPlan: string[]
  stablePlan: string[]
  safePlan: string[]
}

type MajorPathwayRule = {
  id: InterestKey
  label: string
  fitScores: string[]
  recommendedMajors: string[]
  employmentDirections: string[]
  upgradeNotes: string
}

type SchoolTypeRule = {
  id: string
  label: string
  bestForScores: string[]
  priority: string
  advantages: string[]
  risks: string[]
  checkpoints: string[]
}

type RiskRule = {
  id: string
  trigger: string
  severity: "low" | "medium" | "high"
  message: string
}

type Candidate = {
  school: GaokaoSchool
  major: GaokaoMajor
  admission: AdmissionScore
  plan?: EnrollmentPlan
  isDemoData: boolean
}

const schools = getGaokaoSchools()
const majors = getGaokaoMajors()
const admissionScores = getAdmissionScores()
const scoreRanks = getScoreRanks()
const provinceRules = getProvinceRules()
const enrollmentPlans = getEnrollmentPlans()
const officialOpenDataSources = getOfficialOpenDataSources()
const scoreSegmentRules = scoreSegmentsData as ScoreSegmentRule[]
const majorPathwayRules = majorPathwaysData as MajorPathwayRule[]
const schoolTypeRules = schoolTypeRulesData as SchoolTypeRule[]
const riskRules = riskRulesData as RiskRule[]

export const subjectTypeOptions: Array<{
  value: ExtendedSubjectType
  label: string
}> = [
  { value: "physics", label: "物理类" },
  { value: "history", label: "历史类" },
  { value: "comprehensive", label: "综合改革" },
  { value: "science", label: "理科" },
  { value: "arts", label: "文科" },
]

export const interestOptions: Array<{
  value: InterestKey
  label: string
}> = [
  { value: "software", label: "计算机软件" },
  { value: "electrical-automation", label: "电气自动化" },
  { value: "intelligent-manufacturing", label: "机械智能制造" },
  { value: "medical-care", label: "医学护理药学" },
  { value: "teacher-education", label: "师范教育" },
  { value: "accounting-finance", label: "财会金融" },
  { value: "law-public-admin", label: "法学公管" },
  { value: "rail-transit-aviation", label: "铁道交通航空" },
  { value: "architecture-civil", label: "建筑土木" },
  { value: "digital-media-design", label: "数字媒体设计" },
  { value: "agriculture-food", label: "农林食品" },
  { value: "uncertain", label: "不确定" },
]

export const currentGoalOptions: Array<{
  value: CurrentGoal
  label: string
}> = [
  { value: "bachelor", label: "尽量上本科" },
  { value: "stable", label: "稳妥上岸" },
  { value: "employment", label: "就业优先" },
  { value: "upgrade", label: "专升本优先" },
  { value: "city", label: "城市优先" },
  { value: "tuition", label: "学费可控" },
]

export const tuitionToleranceOptions: Array<{
  value: TuitionTolerance
  label: string
}> = [
  { value: "low", label: "低" },
  { value: "medium", label: "中" },
  { value: "high", label: "高" },
]

export const juniorCollegeOptions: Array<{
  value: AcceptanceOption
  label: string
}> = [
  { value: "accept", label: "接受" },
  { value: "reject", label: "不接受" },
  { value: "conditional", label: "视情况而定" },
]

export const outProvinceOptions: Array<{
  value: OutProvinceOption
  label: string
}> = [
  { value: "accept", label: "接受" },
  { value: "reject", label: "不接受" },
  { value: "nearby", label: "只接受周边省份" },
]

export const preferenceOptions: Array<{
  value: VolunteerPreference
  label: string
  description: string
}> = [
  { value: "rush-bachelor", label: "冲本科", description: "保留本科尝试空间" },
  { value: "stable-admission", label: "稳妥录取", description: "优先提高录取确定性" },
  { value: "employment", label: "就业优先", description: "优先专业技能和就业方向" },
  { value: "upgrade", label: "专升本路线", description: "优先升学衔接和可持续路径" },
  { value: "balanced", label: "均衡推荐", description: "兼顾冲稳保结构" },
]

export const levelText: Record<RecommendationLevel, string> = {
  rush: "冲",
  stable: "稳",
  safe: "保",
}

const preferenceCounts: Record<
  VolunteerPreference,
  Record<RecommendationLevel, number>
> = {
  "rush-bachelor": { rush: 10, stable: 8, safe: 6 },
  "stable-admission": { rush: 5, stable: 10, safe: 8 },
  employment: { rush: 4, stable: 8, safe: 10 },
  upgrade: { rush: 5, stable: 10, safe: 8 },
  balanced: { rush: 8, stable: 8, safe: 8 },
}

const levelTargets: Record<
  RecommendationLevel,
  { scoreGap: number; rankGap: number }
> = {
  rush: { scoreGap: 12, rankGap: 8000 },
  stable: { scoreGap: -6, rankGap: 0 },
  safe: { scoreGap: -35, rankGap: -26000 },
}

function normalizeProvince(province: string) {
  return province
    .trim()
    .replace(/壮族自治区|回族自治区|维吾尔自治区|自治区|省|市/g, "")
}

function isSameProvince(left: string, right: string) {
  return normalizeProvince(left) === normalizeProvince(right)
}

function getInterestLabel(interest: InterestKey) {
  return (
    interestOptions.find((option) => option.value === interest)?.label ??
    "综合方向"
  )
}

function getSubjectTypeLabel(subjectType: ExtendedSubjectType) {
  return (
    subjectTypeOptions.find((option) => option.value === subjectType)?.label ??
    "未选择科类"
  )
}

function getScoreSegment(score: number) {
  return (
    scoreSegmentRules.find(
      (segment) => score >= segment.minScore && score <= segment.maxScore,
    ) ??
    scoreSegmentRules[scoreSegmentRules.length - 1]
  )
}

function getSegmentPositionAdvice(score: number, segment: ScoreSegmentRule) {
  const range = Math.max(1, segment.maxScore - segment.minScore)
  const ratio = (score - segment.minScore) / range

  if (ratio <= 0.18) {
    return "当前分数处在本段低位，建议减少激进冲刺，把稳妥录取和可接受保底放在前面。"
  }

  if (ratio <= 0.5) {
    return "当前分数处在本段中低位，可以保留少量上探机会，但主体方案仍应偏稳。"
  }

  if (ratio <= 0.78) {
    return "当前分数处在本段中高位，可以扩大同层次优质专业比较范围。"
  }

  return "当前分数接近本段上沿，可以适度增加上一层次冲刺项，但仍要保留稳妥专业。"
}

function getScoreBandId(segment: ScoreSegmentRule) {
  return `${segment.minScore}-${segment.maxScore + 1}`
}

function getMajorPathway(interest: InterestKey) {
  return (
    majorPathwayRules.find((pathway) => pathway.id === interest) ??
    majorPathwayRules.find((pathway) => pathway.id === "uncertain") ??
    majorPathwayRules[0]
  )
}

function getProvinceRule(province: string) {
  return provinceRules.find((rule) => isSameProvince(rule.province, province))
}

function getInterestAliases(interest: InterestKey) {
  const aliases: Record<InterestKey, string[]> = {
    software: ["software", "computer"],
    "electrical-automation": ["electrical-automation", "engineering", "computer"],
    "intelligent-manufacturing": ["intelligent-manufacturing", "engineering"],
    "medical-care": ["medical-care", "medicine"],
    "teacher-education": ["teacher-education", "education", "humanities"],
    "accounting-finance": ["accounting-finance", "finance"],
    "law-public-admin": ["law-public-admin", "law", "humanities"],
    "rail-transit-aviation": ["rail-transit-aviation", "engineering"],
    "architecture-civil": ["architecture-civil", "engineering"],
    "digital-media-design": ["digital-media-design", "art", "computer"],
    "agriculture-food": ["agriculture-food", "engineering"],
    uncertain: [
      "uncertain",
      "computer",
      "engineering",
      "medicine",
      "education",
      "finance",
    ],
  }

  return aliases[interest]
}

function majorMatchesInterest(major: GaokaoMajor, interest: InterestKey) {
  const aliases = getInterestAliases(interest)
  return major.suitableInterests.some((item) => aliases.includes(item))
}

function getLatestScoreRanks(input: GaokaoInput) {
  const matched = scoreRanks.filter(
    (rank) =>
      isSameProvince(rank.province, input.province) &&
      subjectMatches(rank.subjectType, input.subjectType),
  )

  if (matched.length === 0) {
    return []
  }

  const latestYear = Math.max(...matched.map((rank) => rank.year))
  return matched.filter((rank) => rank.year === latestYear)
}

function estimateRank(input: GaokaoInput) {
  if (typeof input.rank === "number" && input.rank > 0) {
    return input.rank
  }

  const ranks = getLatestScoreRanks(input)

  if (ranks.length > 0) {
    const sorted = [...ranks].sort((a, b) => b.score - a.score)
    const exact = sorted.find((rank) => rank.score === input.score)

    if (exact) {
      return exact.cumulativeCount
    }

    const lowerOrEqual = sorted.find((rank) => rank.score <= input.score)
    return lowerOrEqual?.cumulativeCount ?? sorted[sorted.length - 1].cumulativeCount
  }

  const fullMark = getProvinceRule(input.province)?.scoreFullMark ?? 750
  const normalizedScore = Math.min(Math.max(input.score / fullMark, 0), 0.99)
  const rank = Math.round(
    350000 * Math.pow(Math.max(0.03, 1 - normalizedScore), 1.55) + 500,
  )

  return Math.max(300, rank)
}

function findSchool(name: string) {
  return schools.find((school) => school.name === name)
}

function findMajor(name?: string) {
  if (!name) {
    return undefined
  }

  return majors.find((major) => major.name === name)
}

function findPlan(admission: AdmissionScore) {
  if (!admission.majorName) {
    return undefined
  }

  return (
    enrollmentPlans.find(
      (plan) =>
        isSameProvince(plan.province, admission.province) &&
        plan.schoolName === admission.schoolName &&
        plan.majorName === admission.majorName,
    ) ??
    enrollmentPlans.find(
      (plan) =>
        plan.schoolName === admission.schoolName &&
        plan.majorName === admission.majorName,
    )
  )
}

function subjectMatches(
  recordSubject: string | GaokaoSubjectType,
  inputSubject: ExtendedSubjectType,
) {
  if (recordSubject === inputSubject) {
    return true
  }

  if (inputSubject === "physics") {
    return recordSubject === "science"
  }

  if (inputSubject === "history") {
    return recordSubject === "arts"
  }

  return recordSubject === "comprehensive"
}

function isDemoCandidate(candidate: Pick<Candidate, "school" | "major" | "admission" | "plan">) {
  return Boolean(
    candidate.school.isDemo ||
      candidate.major.isDemo ||
      candidate.admission.isDemo ||
      candidate.plan?.isDemo,
  )
}

function createAllCandidates() {
  return admissionScores.flatMap<Candidate>((admission) => {
    const school = findSchool(admission.schoolName)
    const major = findMajor(admission.majorName)

    if (!school || !major) {
      return []
    }

    const plan = findPlan(admission)
    const candidate = {
      school,
      major,
      admission,
      plan,
    }

    return [
      {
        ...candidate,
        isDemoData: isDemoCandidate(candidate),
      },
    ]
  })
}

function uniqueCandidates(candidates: Candidate[]) {
  const seen = new Set<string>()

  return candidates.filter((candidate) => {
    const key = getCandidateKey(candidate)

    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

function filterCandidates(input: GaokaoInput, candidates: Candidate[]) {
  const sameProvinceAndSubject = candidates.filter(
    (candidate) =>
      isSameProvince(candidate.admission.province, input.province) &&
      subjectMatches(candidate.admission.subjectType, input.subjectType),
  )

  const sameProvince = candidates.filter((candidate) =>
    isSameProvince(candidate.admission.province, input.province),
  )

  const sameSubject = candidates.filter((candidate) =>
    subjectMatches(candidate.admission.subjectType, input.subjectType),
  )

  if (input.acceptsOutOfProvince === "accept") {
    return uniqueCandidates([
      ...sameProvinceAndSubject,
      ...sameSubject,
      ...sameProvince,
      ...candidates,
    ])
  }

  if (input.acceptsOutOfProvince === "nearby") {
    return uniqueCandidates([
      ...sameProvinceAndSubject,
      ...sameProvince,
      ...sameSubject,
      ...candidates,
    ])
  }

  if (sameProvinceAndSubject.length > 0) {
    return sameProvinceAndSubject
  }

  if (sameProvince.length > 0) {
    return sameProvince
  }

  return sameSubject.length > 0 ? sameSubject : candidates
}

function getRealAdmissionScoresForProvince(province: string) {
  return admissionScores.filter(
    (score) => isSameProvince(score.province, province) && !score.isDemo,
  )
}

function getRealScoreRanksForProvince(province: string) {
  return scoreRanks.filter(
    (rank) => isSameProvince(rank.province, province) && !rank.isDemo,
  )
}

function getRealPlansForProvince(province: string) {
  return enrollmentPlans.filter(
    (plan) => isSameProvince(plan.province, province) && !plan.isDemo,
  )
}

function getOfficialSourcesForProvince(province: string) {
  return officialOpenDataSources.filter((source) =>
    isSameProvince(source.province, province),
  )
}

export function getGaokaoDataCoverage(input: Pick<GaokaoInput, "province">) {
  const realAdmissions = getRealAdmissionScoresForProvince(input.province)
  const realRanks = getRealScoreRanksForProvince(input.province)
  const realPlans = getRealPlansForProvince(input.province)
  const officialSources = getOfficialSourcesForProvince(input.province)
  const coveredYears = Array.from(
    new Set(realAdmissions.map((item) => item.year)),
  ).sort((a, b) => b - a)
  const hasMajorAdmissionScores = realAdmissions.some((item) => item.majorName)

  return {
    province: input.province,
    hasRealAdmissionScores: realAdmissions.length > 0,
    coveredYears,
    hasScoreRanks: realRanks.length > 0,
    hasEnrollmentPlans: realPlans.length > 0,
    hasMajorAdmissionScores,
    officialSources,
    message:
      realAdmissions.length > 0
        ? "当前省份已接入部分真实来源数据，仍需以官方最新发布为准。"
        : officialSources.length > 0
          ? "当前省份已登记官方公开来源入口，但完整录取数据库尚未结构化接入。系统优先提供分数段策略建议，具体院校录取概率请以官方信息为准。"
          : "当前省份完整录取数据库尚未接入，系统优先提供分数段策略建议。具体院校录取概率请以省教育考试院、阳光高考和高校招生章程为准。",
  } satisfies DataCoverageStatus
}

function createCandidates(input: GaokaoInput) {
  const allCandidates = createAllCandidates()
  const officialCandidates = allCandidates.filter((candidate) => !candidate.isDemoData)
  const filteredOfficial = filterCandidates(input, officialCandidates)

  if (filteredOfficial.length >= 3) {
    return filteredOfficial
  }

  return filterCandidates(input, allCandidates)
}

function getRiskWarnings(input: GaokaoInput, segment: ScoreSegmentRule) {
  const triggers = new Set<string>(["general"])

  if (!input.rank) {
    triggers.add("rank_missing")
  }

  if (input.score < 380) {
    triggers.add("score_below_380_private_bachelor")
  }

  if (input.tuitionTolerance === "low") {
    triggers.add("low_tuition_private_bachelor")
  }

  if (input.acceptsJuniorCollege === "reject" && input.score < 500) {
    triggers.add("reject_junior_college_under_500")
  }

  if (input.currentGoal === "employment" || input.preference === "employment") {
    triggers.add("employment_goal")
  }

  if (segment.id === "score-450-500") {
    triggers.add("score_450_500")
  }

  if (input.acceptsOutOfProvince !== "reject") {
    triggers.add("out_province_conditional")
  }

  const matchedRules = riskRules.filter((rule) => triggers.has(rule.trigger))
  return Array.from(new Set([...segment.riskWarnings, ...matchedRules.map((rule) => rule.message)]))
}

function getTradeoffAnalysis(input: GaokaoInput, segment: ScoreSegmentRule) {
  return [
    {
      title: "本科机会判断",
      description: segment.bachelorOpportunity,
      items:
        input.preference === "rush-bachelor" || input.currentGoal === "bachelor"
          ? ["可以保留本科冲刺项，但不能用不可接受专业做代价。", "本科判断应优先使用位次而不是分数。"]
          : ["本科可作为选项之一，但不应压过专业质量和录取稳定性。"],
    },
    {
      title: "专科优先级判断",
      description: segment.juniorCollegePriority,
      items:
        input.acceptsJuniorCollege === "reject"
          ? ["你当前不接受专科，但建议至少保留强专科兜底清单用于比较。"]
          : ["优质公办专科、行业类高职和王牌专业应进入重点比较池。"],
    },
    {
      title: "民办本科风险判断",
      description: segment.privateBachelorRisk,
      items:
        input.tuitionTolerance === "low"
          ? ["家庭学费承受能力较低，民办本科和高收费专业需要非常谨慎。"]
          : ["若选择民办本科，仍需核对学费、校区、专业质量和就业去向。"],
    },
    {
      title: "职业本科取舍",
      description: "职业本科适合重视应用能力和本科层次的考生，但需要逐校核对专业质量。",
      items: ["重点看专业是否实用、实训条件是否真实、往年位次是否稳定。"],
    },
  ]
}

function getRecommendedPaths(input: GaokaoInput, segment: ScoreSegmentRule) {
  const scoreBandId = getScoreBandId(segment)
  return schoolTypeRules
    .filter((rule) => rule.bestForScores.includes(scoreBandId))
    .map((rule) => ({
      title: rule.label,
      description: `优先级：${rule.priority}`,
      items: [
        ...rule.advantages.map((item) => `优势：${item}`),
        ...rule.checkpoints.slice(0, 3).map((item) => `核对：${item}`),
      ],
    }))
}

function getMajorDirectionAdvice(input: GaokaoInput, segment: ScoreSegmentRule) {
  const pathway = getMajorPathway(input.interest)
  const uncertainExtra =
    input.interest === "uncertain"
      ? ["如果暂时不确定方向，优先选择就业面宽、可升本、学费可控的专业。"]
      : []

  return [
    {
      title: pathway.label,
      description: pathway.upgradeNotes,
      items: [
        `建议专业：${pathway.recommendedMajors.join("、")}`,
        `就业方向：${pathway.employmentDirections.join("、")}`,
        ...uncertainExtra,
      ],
    },
  ]
}

function getNextActions(input: GaokaoInput) {
  const rankAction = input.rank
    ? "用当前位次对照近三年目标院校专业组位次。"
    : "查询本省一分一段表，补充准确位次。"

  return [
    rankAction,
    "对照省教育考试院招生计划，确认目标院校和专业是否在本省招生。",
    "查看院校招生章程，重点核对录取规则、专业调剂和身体条件要求。",
    "核对学费和校区，特别是民办本科、校企合作和中外合作项目。",
    "核对专业选科要求，避免因科类或再选科目不符合导致无效填报。",
    "保留 3-5 个保底志愿，并确认这些保底专业自己可以接受。",
    "不要只按学校名气排序，要同时比较专业、城市、学费、就业和升学路径。",
  ]
}

function createStrategyOption(title: string, description: string, items: string[]) {
  return { title, description, items }
}

export function recommendGaokaoPlan(input: GaokaoInput): GaokaoPlan {
  const segment = getScoreSegment(input.score)
  const positionAdvice = getSegmentPositionAdvice(input.score, segment)
  const dataCoverage = getGaokaoDataCoverage(input)
  const recommendations = recommendGaokaoSchools(input)
  const hasDemoData =
    recommendations.length === 0 ||
    recommendations.some((recommendation) => recommendation.isDemoData)
  const majorDirectionAdvice = getMajorDirectionAdvice(input, segment)

  return {
    scorePosition: {
      title: segment.title,
      description: `${segment.positioning}${positionAdvice}`,
    },
    coreAdvice: [positionAdvice, ...segment.coreAdvice],
    riskWarnings: getRiskWarnings(input, segment),
    bachelorOpportunity: segment.bachelorOpportunity,
    juniorCollegePriority: segment.juniorCollegePriority,
    privateBachelorRisk: segment.privateBachelorRisk,
    upgradeRouteSuggestion: segment.upgradeRoute,
    tradeoffAnalysis: getTradeoffAnalysis(input, segment),
    recommendedPaths: getRecommendedPaths(input, segment),
    rushPlan: createStrategyOption(
      "冲刺方案",
      "在不牺牲专业质量和学费承受能力的前提下保留上探空间。",
      segment.rushPlan,
    ),
    stablePlan: createStrategyOption(
      "稳妥方案",
      "把录取稳定性、专业质量和后续发展放在主体位置。",
      segment.stablePlan,
    ),
    safePlan: createStrategyOption(
      "保底方案",
      "确保至少有可以接受、录取概率更稳的兜底选择。",
      segment.safePlan,
    ),
    majorDirectionAdvice,
    nextActions: getNextActions(input),
    dataCoverage,
    recommendations,
    hasDemoData,
  }
}

function getCandidateKey(candidate: Candidate) {
  return `${candidate.school.name}-${candidate.major.name}`
}

function getScoreGap(candidate: Candidate, input: GaokaoInput) {
  if (typeof candidate.admission.minScore !== "number") {
    return undefined
  }

  return candidate.admission.minScore - input.score
}

function getRankGap(candidate: Candidate, estimatedRank: number) {
  if (typeof candidate.admission.minRank !== "number") {
    return undefined
  }

  return estimatedRank - candidate.admission.minRank
}

function isCandidateForLevel(
  candidate: Candidate,
  input: GaokaoInput,
  estimatedRank: number,
  level: RecommendationLevel,
) {
  const scoreGap = getScoreGap(candidate, input)
  const rankGap = getRankGap(candidate, estimatedRank)

  if (level === "rush") {
    return (
      (typeof rankGap === "number" && rankGap > 0 && rankGap <= 20000) ||
      (typeof scoreGap === "number" && scoreGap >= 0 && scoreGap <= 20)
    )
  }

  if (level === "stable") {
    return (
      (typeof rankGap === "number" && rankGap >= -12000 && rankGap <= 8000) ||
      (typeof scoreGap === "number" && scoreGap >= -20 && scoreGap <= 5)
    )
  }

  return (
    (typeof rankGap === "number" && rankGap < -12000) ||
    (typeof scoreGap === "number" && scoreGap < -20)
  )
}

function scoreCandidate(
  candidate: Candidate,
  input: GaokaoInput,
  estimatedRank: number,
  level: RecommendationLevel,
) {
  const target = levelTargets[level]
  const scoreGap = getScoreGap(candidate, input)
  const rankGap = getRankGap(candidate, estimatedRank)
  const scoreFit =
    typeof scoreGap === "number"
      ? Math.max(0, 90 - Math.abs(scoreGap - target.scoreGap) * 2)
      : 0
  const rankFit =
    typeof rankGap === "number"
      ? Math.max(0, 80 - Math.abs(rankGap - target.rankGap) / 800)
      : 0
  const interestFit = majorMatchesInterest(candidate.major, input.interest) ? 50 : 0
  const provinceFit = isSameProvince(candidate.admission.province, input.province)
    ? 24
    : 6
  const subjectFit = subjectMatches(candidate.admission.subjectType, input.subjectType)
    ? 18
    : 0
  const planFit = candidate.plan?.plannedCount
    ? Math.min(12, Math.max(4, candidate.plan.plannedCount / 3))
    : 0
  const officialFit = candidate.isDemoData ? 0 : 18

  return scoreFit + rankFit + interestFit + provinceFit + subjectFit + planFit + officialFit
}

function formatRankGap(rankGap: number | undefined) {
  if (typeof rankGap !== "number") {
    return "当前记录缺少最低位次，暂用分数近似匹配"
  }

  if (rankGap > 0) {
    return `粗略估算位次比历史最低位次靠后约 ${rankGap.toLocaleString()} 名`
  }

  if (rankGap === 0) {
    return "粗略估算位次与历史最低位次接近"
  }

  return `粗略估算位次比历史最低位次靠前约 ${Math.abs(rankGap).toLocaleString()} 名`
}

function formatScoreGap(scoreGap: number | undefined, isDemoData: boolean) {
  const label = isDemoData ? "演示最低分" : "历史最低分"

  if (typeof scoreGap !== "number") {
    return "当前记录缺少最低分，暂用位次近似匹配"
  }

  if (scoreGap > 0) {
    return `${label}高出当前分数约 ${scoreGap} 分`
  }

  if (scoreGap === 0) {
    return `${label}与当前分数接近`
  }

  return `${label}低于当前分数约 ${Math.abs(scoreGap)} 分`
}

function createRecommendation(
  candidate: Candidate,
  input: GaokaoInput,
  estimatedRank: number,
  level: RecommendationLevel,
): SchoolRecommendation {
  const scoreGap = getScoreGap(candidate, input)
  const rankGap = getRankGap(candidate, estimatedRank)
  const interestLabel = getInterestLabel(input.interest)
  const subjectLabel = getSubjectTypeLabel(input.subjectType)
  const baseSuggestion: Record<RecommendationLevel, string> = {
    rush:
      "可放在志愿表前段作为尝试项，同时准备同方向更稳妥的替代院校。",
    stable:
      "建议作为主体候选，继续比较专业培养方案、城市资源和转专业政策。",
    safe:
      "适合作为兜底候选，但仍要确认专业接受度和未来学习路径。",
  }
  const planText = candidate.plan
    ? `招生计划记录：${candidate.plan.plannedCount ?? "未标注"} 人，学费 ${candidate.plan.tuition ?? "未标注"}，选科要求：${candidate.plan.subjectRequirement ?? "未标注"}。`
    : "当前没有匹配到招生计划记录，需要继续补充官方计划数据。"
  const dataLabel = candidate.isDemoData ? "演示" : "真实来源"
  const minRankText =
    typeof candidate.admission.minRank === "number"
      ? `最低位次约 ${candidate.admission.minRank.toLocaleString()}`
      : "最低位次未标注"
  const minScoreText =
    typeof candidate.admission.minScore === "number"
      ? `最低分 ${candidate.admission.minScore}`
      : "最低分未标注"

  return {
    id: `${candidate.school.id}-${candidate.major.id}-${level}`,
    name: candidate.school.name,
    city: candidate.school.city,
    major: candidate.major.name,
    level,
    reason: `参考 ${candidate.admission.year} 年${candidate.admission.province}${candidate.admission.batch}${dataLabel}数据，${minScoreText}、${minRankText}；${formatScoreGap(scoreGap, candidate.isDemoData)}，${formatRankGap(rankGap)}。该专业与「${interestLabel}」方向匹配，当前科类为${subjectLabel}。`,
    risk: candidate.isDemoData
      ? "当前结果包含演示数据，真实数据仍在接入中，不代表真实招生计划和录取结果。"
      : "已接入来源数据，但仍需核对省教育考试院、阳光高考和高校招生章程等官方信息。",
    suitableFor: `${candidate.school.description ?? candidate.school.name} 专业方向可延伸到：${candidate.major.careerDirections.slice(0, 3).join("、")}。`,
    suggestion: `${baseSuggestion[level]} ${planText}`,
    sourceName: candidate.admission.sourceName,
    sourceUrl: candidate.admission.sourceUrl,
    dataYear: candidate.admission.year,
    isOfficialData: !candidate.isDemoData,
    isDemoData: candidate.isDemoData,
  }
}

function pickForLevel(
  input: GaokaoInput,
  level: RecommendationLevel,
  count: number,
  candidates: Candidate[],
  usedKeys: Set<string>,
  estimatedRank: number,
) {
  const available = candidates.filter(
    (candidate) => !usedKeys.has(getCandidateKey(candidate)),
  )
  const strictCandidates = available.filter((candidate) =>
    isCandidateForLevel(candidate, input, estimatedRank, level),
  )
  const allStrictCandidates = candidates.filter((candidate) =>
    isCandidateForLevel(candidate, input, estimatedRank, level),
  )
  const pool =
    strictCandidates.length >= count
      ? strictCandidates
      : available.length > 0
        ? available
        : allStrictCandidates.length > 0
          ? allStrictCandidates
          : candidates

  return [...pool]
    .sort(
      (a, b) =>
        scoreCandidate(b, input, estimatedRank, level) -
        scoreCandidate(a, input, estimatedRank, level),
    )
    .slice(0, count)
    .map((candidate) => {
      usedKeys.add(getCandidateKey(candidate))
      return createRecommendation(candidate, input, estimatedRank, level)
    })
}

export function recommendGaokaoSchools(input: GaokaoInput) {
  const candidates = createCandidates(input)

  if (candidates.length === 0) {
    return []
  }

  const estimatedRank = estimateRank(input)
  const usedKeys = new Set<string>()
  const counts = preferenceCounts[input.preference]

  return (["rush", "stable", "safe"] as RecommendationLevel[]).flatMap(
    (level) =>
      pickForLevel(input, level, counts[level], candidates, usedKeys, estimatedRank),
  )
}

export function groupRecommendations(recommendations: SchoolRecommendation[]) {
  return {
    rush: recommendations.filter((item) => item.level === "rush"),
    stable: recommendations.filter((item) => item.level === "stable"),
    safe: recommendations.filter((item) => item.level === "safe"),
  }
}
