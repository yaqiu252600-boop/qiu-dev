import admissionScoresData from "@/data/gaokao/processed/admission-scores.json"
import enrollmentPlansData from "@/data/gaokao/processed/enrollment-plans.json"
import majorsData from "@/data/gaokao/processed/majors.json"
import provinceRulesData from "@/data/gaokao/processed/province-rules.json"
import schoolsData from "@/data/gaokao/processed/schools.json"
import scoreRanksData from "@/data/gaokao/processed/score-ranks.json"
import officialOpenDataIndexData from "@/data/gaokao/sources/official-open-data-index.json"
import type {
  AdmissionScore,
  EnrollmentPlan,
  GaokaoMajor,
  GaokaoSchool,
  OfficialOpenDataSource,
  ProvinceRule,
  ScoreRank,
} from "@/lib/gaokao-types"

function toArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

export function getGaokaoSchools() {
  return toArray<GaokaoSchool>(schoolsData)
}

export function getGaokaoMajors() {
  return toArray<GaokaoMajor>(majorsData)
}

export function getAdmissionScores() {
  return toArray<AdmissionScore>(admissionScoresData)
}

export function getScoreRanks() {
  return toArray<ScoreRank>(scoreRanksData)
}

export function getEnrollmentPlans() {
  return toArray<EnrollmentPlan>(enrollmentPlansData)
}

export function getProvinceRules() {
  return toArray<ProvinceRule>(provinceRulesData)
}

export function getOfficialOpenDataSources() {
  return toArray<OfficialOpenDataSource>(officialOpenDataIndexData)
}
