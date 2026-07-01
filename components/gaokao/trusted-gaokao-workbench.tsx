"use client"

import type { FormEvent, ReactNode } from "react"
import { useState } from "react"
import { Search, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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

type RecommendationResponse = {
  ok?: boolean
  message?: string
  error?: string
  warnings?: string[]
  recommendations?: {
    rush: AdmissionScore[]
    stable: AdmissionScore[]
    safe: AdmissionScore[]
  }
}

const bucketLabels = {
  rush: "冲刺方案",
  stable: "稳妥方案",
  safe: "保底方案",
} as const

export function TrustedGaokaoWorkbench() {
  const [keyword, setKeyword] = useState("")
  const [universities, setUniversities] = useState<University[]>([])
  const [universityMessage, setUniversityMessage] = useState(
    "输入学校名称或学校标识码，只查询教育部官方高校名单。",
  )
  const [province, setProvince] = useState("江苏")
  const [year, setYear] = useState("2025")
  const [subjectType, setSubjectType] = useState("physics")
  const [score, setScore] = useState("520")
  const [rank, setRank] = useState("")
  const [recommendation, setRecommendation] =
    useState<RecommendationResponse | null>(null)

  async function handleUniversitySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const response = await fetch(
      `/api/universities?keyword=${encodeURIComponent(keyword)}`,
    )
    const result = (await response.json()) as {
      data?: University[]
      message?: string
    }

    setUniversities(result.data ?? [])
    setUniversityMessage(result.message ?? "查询完成。")
  }

  async function handleRecommend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams({
      province,
      year,
      subject_type: subjectType,
      score,
      batch_name: "普通类本科批次平行志愿",
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
              数据来自教育部 2026 年全国普通高等学校名单。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex gap-2" onSubmit={handleUniversitySearch}>
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="例如：南京大学、4132010284、苏州"
                className="h-10 flex-1 rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
              />
              <Button type="submit">
                <Search className="h-4 w-4" aria-hidden="true" />
                查询
              </Button>
            </form>
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
            <CardTitle>投档线辅助分析</CardTitle>
            <CardDescription>
              当前可用：江苏 2025 普通类本科批次平行志愿投档线。江苏
              2026 逐分段表已保存官方原图，待人工校验后再参与位次换算。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleRecommend}>
              <Field label="省份">
                <input
                  value={province}
                  onChange={(event) => setProvince(event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                />
              </Field>
              <Field label="年份">
                <select
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
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
              <Field label="位次（建议填写）">
                <input
                  value={rank}
                  onChange={(event) => setRank(event.target.value)}
                  inputMode="numeric"
                  placeholder="没有逐分段表时必须手动填写"
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                />
              </Field>
              <div className="flex items-end">
                <Button type="submit" className="w-full">
                  生成可信分析
                </Button>
              </div>
            </form>

            <RecommendationPanel recommendation={recommendation} />
          </CardContent>
        </Card>
      </div>
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

  return (
    <div className="mt-5 space-y-5">
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
                  {item.university_code} / 最低分 {item.min_score} / 最低位次{" "}
                  {item.min_rank ?? "暂无可信数据"}
                  {typeof item.score_gap === "number"
                    ? ` / 分差 ${item.score_gap}`
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
