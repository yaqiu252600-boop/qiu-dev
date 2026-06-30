import {
  currentGoalOptions,
  interestOptions,
  preferenceOptions,
  subjectTypeOptions,
  type GaokaoInput,
} from "@/lib/gaokao"

function findLabel<T extends string>(
  options: Array<{ value: T; label: string }>,
  value: T,
) {
  return options.find((option) => option.value === value)?.label ?? value
}

export function GaokaoSummary({ input }: { input: GaokaoInput }) {
  const items = [
    { label: "省份", value: input.province },
    { label: "分数", value: `${input.score} 分` },
    { label: "位次", value: input.rank ? `${input.rank.toLocaleString()} 名` : "未填写" },
    {
      label: "科类",
      value: findLabel(subjectTypeOptions, input.subjectType),
    },
    {
      label: "目标",
      value: findLabel(currentGoalOptions, input.currentGoal),
    },
    {
      label: "兴趣方向",
      value: findLabel(interestOptions, input.interest),
    },
    {
      label: "偏好",
      value:
        preferenceOptions.find((option) => option.value === input.preference)
          ?.label ?? "均衡推荐",
    },
  ]

  return (
    <div className="grid gap-3 rounded-lg border border-border bg-white p-4 sm:grid-cols-3 xl:grid-cols-7">
      {items.map((item) => (
        <div key={item.label}>
          <div className="text-xs text-muted-foreground">{item.label}</div>
          <div className="mt-1 text-sm font-medium text-foreground">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  )
}
