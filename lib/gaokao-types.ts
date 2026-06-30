export type GaokaoSubjectType =
  | "physics"
  | "history"
  | "comprehensive"
  | "science"
  | "arts"

export type DataSourceMode = "official" | "demo"

export type GaokaoSchool = {
  id: string
  name: string
  province: string
  city: string
  level?: string
  schoolType?: string
  ownership?: string
  tags: string[]
  description?: string
  sourceName: string
  sourceUrl: string
  updatedAt: string
  isDemo?: boolean
}

export type GaokaoMajor = {
  id: string
  name: string
  category: string
  degree?: string
  description?: string
  suitableInterests: string[]
  careerDirections: string[]
  sourceName: string
  sourceUrl: string
  updatedAt: string
  isDemo?: boolean
}

export type AdmissionScore = {
  id: string
  province: string
  year: number
  schoolName: string
  majorName?: string
  subjectType: GaokaoSubjectType
  batch: string
  minScore?: number
  minRank?: number
  avgScore?: number
  maxScore?: number
  sourceName: string
  sourceUrl: string
  updatedAt: string
  isDemo?: boolean
}

export type ScoreRank = {
  id: string
  province: string
  year: number
  subjectType: string
  score: number
  sameScoreCount?: number
  cumulativeCount: number
  sourceName: string
  sourceUrl: string
  updatedAt: string
  isDemo?: boolean
}

export type EnrollmentPlan = {
  id: string
  province: string
  year: number
  schoolName: string
  majorName: string
  subjectRequirement?: string
  plannedCount?: number
  tuition?: string
  duration?: string
  sourceName: string
  sourceUrl: string
  updatedAt: string
  isDemo?: boolean
}

export type ProvinceRule = {
  id?: string
  province: string
  scoreFullMark: number
  subjectTypes: GaokaoSubjectType[]
  batchTypes: string[]
  sourceName?: string
  sourceUrl?: string
  updatedAt?: string
  isDemo?: boolean
}

export type OfficialOpenDataSource = {
  id: string
  province: string
  year: number
  title: string
  dataTypes: string[]
  sourceName: string
  sourceUrl: string
  publishedAt?: string
  fetchedAt: string
  status:
    | "verified_source_page"
    | "download_pending"
    | "parsed"
    | "blocked_by_policy"
  rawFileName?: string
  rawFileUrl?: string
  reusePolicy: "source_index_only" | "raw_download_allowed" | "requires_review"
  licenseNote: string
  notes: string
}
