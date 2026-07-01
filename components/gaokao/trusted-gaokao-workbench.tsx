"use client"

import type { FormEvent, ReactNode } from "react"
import { useState } from "react"
import { Database, Search, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ProvinceDataOverview } from "@/lib/trusted-gaokao"

type University = {
  id: string
  name: string
  school_code: string
  province: string
  city: string
  authority: string
  education_level: string
  remark: string
  source_name: string
  source_url: string
  source_updated_at: string
}

type AdmissionScore = {
  id: string
  year: number
  province: string
  subject_type: string
  batch_name: string
  university_code: string
  university_name: string
  major_group_code: string
  major_name: string
  min_score: number
  min_rank?: number
  source_name: string
  source_url: string
  source_updated_at: string
  score_gap?: number
  rank_gap?: number
}

type RecommendationMode = "rank_recommendation" | "score_reference"

type RecommendationResponse = {
  ok?: boolean
  message?: string
  error?: string
  recommendation_mode?: RecommendationMode
  warnings?: string[]
  recommendations?: {
    rush: AdmissionScore[]
    stable: AdmissionScore[]
    safe: AdmissionScore[]
  }
}

type TrustedGaokaoWorkbenchProps = {
  provinceStatuses: ProvinceDataOverview[]
}

const rankBucketLabels = {
  rush: "位次冲刺参考",
  stable: "位次稳妥参考",
  safe: "位次保底参考",
} as const

const scoreBucketLabels = {
  rush: "历史最低分略高于当前分数",
  stable: "历史最低分接近当前分数",
  safe: "历史最低分低于当前分数",
} as const

export function TrustedGaokaoWorkbench({
  provinceStatuses,
}: TrustedGaokaoWorkbenchProps) {
  const [keyword, setKeyword] = useState("")
  const [universities, setUniversities] = useState<University[]>([])
  const [universityMessage, setUniversityMessage] = useState(
    "可留空查看当前省份高校，也可输入学校名称、学校标识码或城市。",
  )
  const [province, setProvince] = useState(
    provinceStatuses.find((item) => item.province === "江苏")?.province ??
      provinceStatuses[0]?.province ??
      "江苏",
  )
  const [year, setYear] = useState("2025")
  const [subjectType, setSubjectType] = useState("physics")
  const [score, setScore] = useState("520")
  const [rank, setRank] = useState("")
  const [recommendation, setRecommendation] =
    useState<RecommendationResponse | null>(null)
  const selectedStatus =
    provinceStatuses.find((item) => item.province === province) ??
    provinceStatuses[0]
  const canShowReference = selectedStatus?.support_capabilities.includes(
    "可做分数参考",
  )
  const canShowFull = selectedStatus?.support_capabilities.includes(
    "可做完整志愿辅助分析",
  )

  async function handleUniversitySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams({ province })

    if (keyword.trim()) {
      params.set("keyword", keyword.trim())
    }

    const response = await fetch(`/api/universities?${params.toString()}`)
    const result = (await response.json()) as {
      data?: University[]
      message?: string
    }

    setUniversities(result.data ?? [])
    setUniversityMessage(
      result.message ??
        `已按${province}筛选教育部 2026 年全国普通高等学校名单。`,
    )
  }

  async function handleRecommend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams({
      province,
      year,
      subject_type: subjectType,
      score,
    })

    if (rank.trim()) {
      params.set("rank", rank.trim())
    }

    const response = await fetch(`/api/recommendations?${params.toString()}`)
    const result = (await response.json()) as RecommendationResponse

    setRecommendation(result)
  }

  return (
    <div className="space-y-6">
      <Card className="border-blue-100 bg-blue-50 shadow-none">
        <CardContent className="flex gap-3 p-4 text-sm leading-6 text-blue-950">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p>
            本工具仅整理公开数据并做辅助分析，最终志愿填报请以各省教育考试院和高校官方发布信息为准。
            系统禁止生成不存在的学校、专业、分数线、位次或招生计划。
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>院校搜索</CardTitle>
            <CardDescription>
              按右侧当前省份筛选教育部 2026 年全国普通高等学校名单。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex gap-2" onSubmit={handleUniversitySearch}>
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder={`例如：${province === "江苏" ? "南京大学、苏州" : "大学、城市名"}；留空查${province}高校`}
                className="h-10 flex-1 rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
              />
              <Button type="submit">
                <Search className="h-4 w-4" aria-hidden="true" />
                查高校
              </Button>
            </form>
            <p className="mt-2 text-xs text-muted-foreground">
              这个功能全国省份都可用；投档线参考、位次换算和招生计划辅助会按右侧数据状态开放。
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              {universityMessage}
            </p>
            <div className="mt-4 max-h-[420px] space-y-3 overflow-auto">
              {universities.map((university) => (
                <div
                  key={university.id}
                  className="rounded-md border border-border p-3 text-sm"
                >
                  <div className="font-medium text-foreground">
                    {university.name}
                  </div>
                  <div className="mt-1 text-muted-foreground">
                    {university.school_code} / {university.province}
                    {university.city} / {university.education_level}
                    {university.remark ? ` / ${university.remark}` : ""}
                  </div>
                  <a
                    href={university.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-xs text-primary"
                  >
                    {university.source_name} / {university.source_updated_at}
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>全国省份数据状态</CardTitle>
            <CardDescription>
              省份选择器覆盖全国 31 个省级行政区。江苏显示独立任务状态，本轮不覆盖其数据。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Field label="省份">
              <select
                value={province}
                onChange={(event) => {
                  setProvince(event.target.value)
                  setRecommendation(null)
                  setUniversities([])
                  setUniversityMessage(
                    `已切换到${event.target.value}。可留空查看该省高校，投档线/招生计划只在 verified 数据存在时开放。`,
                  )
                }}
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
              >
                {provinceStatuses.map((item) => (
                  <option key={item.province} value={item.province}>
                    {item.province}
                  </option>
                ))}
              </select>
            </Field>

            {selectedStatus ? <ProvinceStatusPanel status={selectedStatus} /> : null}

            {canShowReference ? (
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleRecommend}>
                <div className="sm:col-span-2 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                  {canShowFull
                    ? "该省已具备完整志愿辅助分析所需数据。"
                    : "该省当前只能查看历史投档最低分参考。"}
                </div>
              <Field label="省份">
                <input
                  value={province}
                  readOnly
                  className="h-10 w-full rounded-md border border-input bg-slate-50 px-3 text-sm outline-none"
                />
              </Field>
              <Field label="年份">
                <select
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                >
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2026">2026</option>
                </select>
              </Field>
              <Field label="科类">
                <select
                  value={subjectType}
                  onChange={(event) => setSubjectType(event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                >
                  <option value="physics">物理等科目类</option>
                  <option value="history">历史等科目类</option>
                </select>
              </Field>
              <Field label="分数">
                <input
                  value={score}
                  onChange={(event) => setScore(event.target.value)}
                  inputMode="numeric"
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                />
              </Field>
              <Field label="位次（可选）">
                <input
                  value={rank}
                  onChange={(event) => setRank(event.target.value)}
                  inputMode="numeric"
                  placeholder="只有投档线含 min_rank 时才参与位次推荐"
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                />
              </Field>
              <div className="flex items-end">
                <Button type="submit" className="w-full">
                  查看历史投档参考
                </Button>
              </div>
            </form>
            ) : (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                <div className="font-medium text-amber-950">暂不显示分析入口</div>
                <ul className="mt-2 space-y-1">
                  {selectedStatus?.unavailable_reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            <RecommendationPanel recommendation={recommendation} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ProvinceStatusPanel({ status }: { status: ProvinceDataOverview }) {
  return (
    <div className="space-y-4">
      {status.handled_independently ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          江苏由独立任务处理中，本轮全国扩展不覆盖江苏数据。
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <StatusMetric label="高校基础库" value={status.universities_status} />
        <StatusMetric label="一分一段" value={status.score_segments_status} />
        <StatusMetric
          label="2023 投档线"
          value={status.admission_scores_by_year["2023"]}
        />
        <StatusMetric
          label="2024 投档线"
          value={status.admission_scores_by_year["2024"]}
        />
        <StatusMetric
          label="2025 投档线"
          value={status.admission_scores_by_year["2025"]}
        />
        <StatusMetric label="招生计划" value={status.admission_plans_status} />
        <StatusMetric label="志愿规则" value={status.province_rules_status} />
      </div>
      <div className="rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">
        <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
          <Database className="h-4 w-4" aria-hidden="true" />
          当前支持能力
        </div>
        <p>{status.support_capabilities.join("、")}</p>
      </div>
      <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
        <a href={status.official_site} target="_blank" rel="noreferrer" className="text-primary">
          {status.official_site}
        </a>
        <a
          href={status.gaokao_channel_url}
          target="_blank"
          rel="noreferrer"
          className="text-primary"
        >
          {status.gaokao_channel_url}
        </a>
      </div>
    </div>
  )
}

function StatusMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-3 text-sm">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium text-foreground">{value}</div>
    </div>
  )
}

function RecommendationPanel({
  recommendation,
}: {
  recommendation: RecommendationResponse | null
}) {
  if (!recommendation) {
    return (
      <p className="mt-5 rounded-md bg-slate-50 p-4 text-sm text-muted-foreground">
        推荐结果只会来自已导入的官方投档线数据。没有数据时不会生成学校。
      </p>
    )
  }

  if (recommendation.error) {
    return (
      <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        {recommendation.error}
      </div>
    )
  }

  const buckets = recommendation.recommendations ?? {
    rush: [],
    stable: [],
    safe: [],
  }
  const mode = recommendation.recommendation_mode ?? "score_reference"
  const bucketLabels =
    mode === "rank_recommendation" ? rankBucketLabels : scoreBucketLabels

  return (
    <div className="mt-5 space-y-5">
      <div className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
        <div className="font-medium text-foreground">
          {mode === "rank_recommendation" ? "已验证位次推荐" : "仅分数参考"}
        </div>
        <p>{recommendation.message}</p>
      </div>

      {recommendation.warnings?.length ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          {recommendation.warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}

      {(["rush", "stable", "safe"] as const).map((bucket) => (
        <section key={bucket}>
          <h3 className="mb-3 text-base font-semibold text-foreground">
            {bucketLabels[bucket]} / {buckets[bucket].length} 条
          </h3>
          <div className="space-y-3">
            {buckets[bucket].map((item) => (
              <div
                key={item.id}
                className="rounded-md border border-border p-3 text-sm"
              >
                <div className="font-medium text-foreground">
                  {item.university_name}
                  {item.major_group_code ? `${item.major_group_code}专业组` : ""}
                  {item.major_name}
                </div>
                <div className="mt-1 text-muted-foreground">
                  {item.year} / {item.batch_name} / 院校代码{" "}
                  {item.university_code} / 最低分 {item.min_score}
                  {typeof item.min_rank === "number"
                    ? ` / 最低位次 ${item.min_rank}`
                    : " / 最低位次 暂无可信数据"}
                  {typeof item.score_gap === "number"
                    ? ` / 分差 ${item.score_gap}`
                    : ""}
                  {typeof item.rank_gap === "number"
                    ? ` / 位次差 ${item.rank_gap}`
                    : ""}
                </div>
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-xs text-primary"
                >
                  {item.source_name} / {item.source_updated_at}
                </a>
              </div>
            ))}
            {buckets[bucket].length === 0 ? (
              <p className="rounded-md bg-slate-50 p-3 text-sm text-muted-foreground">
                当前分数附近暂无该层级可信投档线记录。
              </p>
            ) : null}
          </div>
        </section>
      ))}
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  )
}
