"use client"

import type { FormEvent, ReactNode } from "react"
import { useState } from "react"
import { RefreshCw, Sparkles } from "lucide-react"

import { GaokaoSummary } from "@/components/gaokao/gaokao-summary"
import { RecommendationResults } from "@/components/gaokao/recommendation-results"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  currentGoalOptions,
  interestOptions,
  juniorCollegeOptions,
  outProvinceOptions,
  preferenceOptions,
  recommendGaokaoPlan,
  subjectTypeOptions,
  tuitionToleranceOptions,
  type AcceptanceOption,
  type CurrentGoal,
  type ExtendedSubjectType,
  type GaokaoInput,
  type GaokaoPlan,
  type InterestKey,
  type OutProvinceOption,
  type TuitionTolerance,
  type VolunteerPreference,
} from "@/lib/gaokao"

type FormState = {
  province: string
  score: string
  rank: string
  subjectType: "" | ExtendedSubjectType
  currentGoal: CurrentGoal
  interest: "" | InterestKey
  tuitionTolerance: TuitionTolerance
  acceptsJuniorCollege: AcceptanceOption
  acceptsOutOfProvince: OutProvinceOption
  preference: VolunteerPreference
}

const initialState: FormState = {
  province: "",
  score: "",
  rank: "",
  subjectType: "",
  currentGoal: "stable",
  interest: "",
  tuitionTolerance: "medium",
  acceptsJuniorCollege: "conditional",
  acceptsOutOfProvince: "nearby",
  preference: "balanced",
}

export function GaokaoForm() {
  const [form, setForm] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {},
  )
  const [plan, setPlan] = useState<GaokaoPlan | null>(null)
  const [submittedInput, setSubmittedInput] = useState<GaokaoInput | null>(null)

  function updateField<Key extends keyof FormState>(
    key: Key,
    value: FormState[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  function validate() {
    const nextErrors: Partial<Record<keyof FormState, string>> = {}
    const score = Number(form.score)
    const rank = form.rank.trim() ? Number(form.rank) : undefined

    if (!form.province.trim()) {
      nextErrors.province = "请填写省份。"
    }

    if (!form.score.trim()) {
      nextErrors.score = "请填写高考分数。"
    } else if (Number.isNaN(score) || score < 0 || score > 750) {
      nextErrors.score = "分数建议填写 0-750 之间的数字。"
    }

    if (rank !== undefined && (Number.isNaN(rank) || rank <= 0)) {
      nextErrors.rank = "位次请填写正整数，或留空。"
    }

    if (!form.subjectType) {
      nextErrors.subjectType = "请选择科类。"
    }

    if (!form.interest) {
      nextErrors.interest = "请选择兴趣方向。"
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!validate() || !form.subjectType || !form.interest) {
      return
    }

    const rank = form.rank.trim() ? Number(form.rank) : undefined
    const input: GaokaoInput = {
      province: form.province.trim(),
      score: Number(form.score),
      rank,
      subjectType: form.subjectType,
      currentGoal: form.currentGoal,
      interest: form.interest,
      tuitionTolerance: form.tuitionTolerance,
      acceptsJuniorCollege: form.acceptsJuniorCollege,
      acceptsOutOfProvince: form.acceptsOutOfProvince,
      preference: form.preference,
    }

    setSubmittedInput(input)
    setPlan(recommendGaokaoPlan(input))
  }

  function handleReset() {
    setForm(initialState)
    setErrors({})
    setPlan(null)
    setSubmittedInput(null)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.3fr]">
      <Card className="h-fit bg-white">
        <CardHeader>
          <CardTitle>生成志愿规划</CardTitle>
          <CardDescription>
            面向 300-550 分段，优先输出分数段定位、路径取舍、风险提醒和行动清单。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Field label="省份" error={errors.province}>
              <input
                value={form.province}
                onChange={(event) => updateField("province", event.target.value)}
                placeholder="例如：广东、河南、山东"
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="高考分数" error={errors.score}>
                <input
                  value={form.score}
                  onChange={(event) => updateField("score", event.target.value)}
                  inputMode="numeric"
                  placeholder="例如：430"
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                />
              </Field>
              <Field label="位次（可选，强烈建议）" error={errors.rank}>
                <input
                  value={form.rank}
                  onChange={(event) => updateField("rank", event.target.value)}
                  inputMode="numeric"
                  placeholder="例如：126000"
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                />
                {!form.rank ? (
                  <span className="block text-xs leading-5 text-muted-foreground">
                    位次比单纯分数更适合判断录取概率，建议结合本省一分一段表补充。
                  </span>
                ) : null}
              </Field>
            </div>

            <Field label="科类" error={errors.subjectType}>
              <select
                value={form.subjectType}
                onChange={(event) =>
                  updateField("subjectType", event.target.value as ExtendedSubjectType)
                }
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
              >
                <option value="">请选择科类</option>
                {subjectTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="当前目标">
              <select
                value={form.currentGoal}
                onChange={(event) =>
                  updateField("currentGoal", event.target.value as CurrentGoal)
                }
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
              >
                {currentGoalOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="兴趣方向" error={errors.interest}>
              <select
                value={form.interest}
                onChange={(event) =>
                  updateField("interest", event.target.value as InterestKey)
                }
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
              >
                <option value="">请选择兴趣方向</option>
                {interestOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="学费承受能力">
                <select
                  value={form.tuitionTolerance}
                  onChange={(event) =>
                    updateField(
                      "tuitionTolerance",
                      event.target.value as TuitionTolerance,
                    )
                  }
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                >
                  {tuitionToleranceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="是否接受专科">
                <select
                  value={form.acceptsJuniorCollege}
                  onChange={(event) =>
                    updateField(
                      "acceptsJuniorCollege",
                      event.target.value as AcceptanceOption,
                    )
                  }
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                >
                  {juniorCollegeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="是否接受外省">
                <select
                  value={form.acceptsOutOfProvince}
                  onChange={(event) =>
                    updateField(
                      "acceptsOutOfProvince",
                      event.target.value as OutProvinceOption,
                    )
                  }
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                >
                  {outProvinceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="志愿偏好" error={errors.preference}>
              <div className="grid gap-2">
                {preferenceOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer gap-3 rounded-md border border-border bg-white p-3 text-sm hover:border-primary/40"
                  >
                    <input
                      type="radio"
                      name="preference"
                      value={option.value}
                      checked={form.preference === option.value}
                      onChange={() => updateField("preference", option.value)}
                      className="mt-1"
                    />
                    <span>
                      <span className="font-medium text-foreground">
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </Field>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" className="sm:flex-1">
                {plan ? <RefreshCw aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
                {plan ? "重新生成方案" : "生成规划方案"}
              </Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                清空重填
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-5">
        {submittedInput ? <GaokaoSummary input={submittedInput} /> : null}
        <RecommendationResults plan={plan} />
      </div>
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
      {error ? <span className="block text-xs text-red-600">{error}</span> : null}
    </label>
  )
}
