import { RecommendationCard } from "@/components/gaokao/recommendation-card"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  groupRecommendations,
  type GaokaoPlan,
  type StrategyOption,
} from "@/lib/gaokao"

export function RecommendationResults({ plan }: { plan: GaokaoPlan | null }) {
  if (!plan) {
    return (
      <Card className="bg-white shadow-none">
        <CardHeader>
          <CardDescription>
            填写分数、位次、科类和目标后，这里会生成分数段定位、路径取舍、冲稳保方案和行动清单。
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const grouped = groupRecommendations(plan.recommendations)

  return (
    <div className="space-y-6">
      <DataCoverageCard plan={plan} />
      {plan.hasDemoData ? (
        <Card className="border-amber-200 bg-amber-50 shadow-none">
          <CardContent className="p-4 text-sm leading-6 text-amber-900">
            当前结果包含演示数据，真实录取数据库仍在接入中。院校录取概率必须以省教育考试院、
            阳光高考和高校招生章程等官方信息为准。
          </CardContent>
        </Card>
      ) : null}

      <SectionCard
        index="1"
        title="你的分数段定位"
        description={plan.scorePosition.title}
        items={[plan.scorePosition.description]}
      />
      <SectionCard index="2" title="核心建议" items={plan.coreAdvice} />
      <SectionCard index="3" title="风险提醒" items={plan.riskWarnings} tone="warning" />
      <TradeoffCard plan={plan} />
      <OptionsSection index="5" title="推荐路径" options={plan.recommendedPaths} />
      <OptionsSection index="6" title="冲刺方案" options={[plan.rushPlan]} />
      <OptionsSection index="7" title="稳妥方案" options={[plan.stablePlan]} />
      <OptionsSection index="8" title="保底方案" options={[plan.safePlan]} />
      <OptionsSection index="9" title="专业方向建议" options={plan.majorDirectionAdvice} />
      <SectionCard index="10" title="下一步行动清单" items={plan.nextActions} />

      {plan.recommendations.length > 0 ? (
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              院校数据补充参考
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              这部分来自已接入数据或演示兜底数据，只作为结构参考，不能替代官方核验。
            </p>
          </div>
          <div className="space-y-6">
            {(["rush", "stable", "safe"] as const).map((level) =>
              grouped[level].length > 0 ? (
                <div key={level} className="grid gap-4 lg:grid-cols-2">
                  {grouped[level].map((recommendation) => (
                    <RecommendationCard
                      key={recommendation.id}
                      recommendation={recommendation}
                    />
                  ))}
                </div>
              ) : null,
            )}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function DataCoverageCard({ plan }: { plan: GaokaoPlan }) {
  const coverage = plan.dataCoverage

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>数据覆盖状态</CardTitle>
            <CardDescription>{coverage.message}</CardDescription>
          </div>
          <Badge
            variant="outline"
            className={
              coverage.hasRealAdmissionScores
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }
          >
            {coverage.hasRealAdmissionScores ? "已接入真实录取数据" : "真实录取数据未接入"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-5">
        <StatusItem
          label="覆盖年份"
          value={coverage.coveredYears.length ? coverage.coveredYears.join("、") : "暂无"}
        />
        <StatusItem label="一分一段" value={coverage.hasScoreRanks ? "已接入" : "未接入"} />
        <StatusItem
          label="招生计划"
          value={coverage.hasEnrollmentPlans ? "已接入" : "未接入"}
        />
        <StatusItem
          label="专业录取"
          value={coverage.hasMajorAdmissionScores ? "已接入" : "未接入"}
        />
        <StatusItem
          label="官方来源索引"
          value={
            coverage.officialSources.length
              ? `${coverage.officialSources.length} 个已登记`
              : "暂无"
          }
        />
      </CardContent>
      {coverage.officialSources.length > 0 ? (
        <CardContent className="border-t border-border pt-0">
          <div className="mb-3 text-sm font-medium text-foreground">
            已核验官方入口
          </div>
          <div className="grid gap-3">
            {coverage.officialSources.map((source) => (
              <a
                key={source.id}
                href={source.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-border p-3 text-sm transition-colors hover:border-primary/40 hover:bg-slate-50"
              >
                <span className="font-medium text-foreground">
                  {source.year} · {source.title}
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  {source.sourceName} · {source.dataTypes.join(" / ")}
                </span>
                <span className="mt-1 block text-xs leading-5 text-amber-700">
                  {source.reusePolicy === "requires_review"
                    ? "已登记来源，结构化入库前仍需确认转载和再分发边界。"
                    : "仅作为官方来源入口展示。"}
                </span>
              </a>
            ))}
          </div>
        </CardContent>
      ) : null}
    </Card>
  )
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium text-foreground">{value}</div>
    </div>
  )
}

function TradeoffCard({ plan }: { plan: GaokaoPlan }) {
  const items = [
    { title: "本科机会判断", content: plan.bachelorOpportunity },
    { title: "专科优先级判断", content: plan.juniorCollegePriority },
    { title: "民办本科风险判断", content: plan.privateBachelorRisk },
    { title: "是否建议专升本路线", content: plan.upgradeRouteSuggestion },
  ]

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>4. 本科 / 专科 / 民办本科 / 职业本科取舍分析</CardTitle>
        <CardDescription>先判断路径，再填具体学校。</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <div key={item.title} className="rounded-md border border-border p-4">
            <div className="text-sm font-medium text-foreground">{item.title}</div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {item.content}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function OptionsSection({
  index,
  title,
  options,
}: {
  index: string
  title: string
  options: StrategyOption[]
}) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-foreground">
        {index}. {title}
      </h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {options.map((option) => (
          <Card key={option.title} className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">{option.title}</CardTitle>
              <CardDescription>{option.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                {option.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

function SectionCard({
  index,
  title,
  description,
  items,
  tone,
}: {
  index: string
  title: string
  description?: string
  items: string[]
  tone?: "warning"
}) {
  return (
    <Card className={tone === "warning" ? "border-amber-200 bg-amber-50" : "bg-white"}>
      <CardHeader>
        <CardTitle>
          {index}. {title}
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
