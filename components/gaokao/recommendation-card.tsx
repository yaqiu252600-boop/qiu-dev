import { MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  levelText,
  type RecommendationLevel,
  type SchoolRecommendation,
} from "@/lib/gaokao"
import { cn } from "@/lib/utils"

const levelStyles: Record<
  RecommendationLevel,
  { badge: string; rail: string; title: string }
> = {
  rush: {
    badge: "border-violet-200 bg-violet-50 text-violet-700",
    rail: "bg-violet-500",
    title: "冲刺院校",
  },
  stable: {
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    rail: "bg-blue-500",
    title: "稳妥院校",
  },
  safe: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rail: "bg-emerald-500",
    title: "保底院校",
  },
}

export function RecommendationCard({
  recommendation,
}: {
  recommendation: SchoolRecommendation
}) {
  const styles = levelStyles[recommendation.level]

  return (
    <Card className="relative h-full overflow-hidden bg-white">
      <div className={cn("absolute inset-y-0 left-0 w-1", styles.rail)} />
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg leading-tight">
              {recommendation.name}
            </CardTitle>
            <CardDescription className="mt-2 flex items-center gap-1">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {recommendation.city}
            </CardDescription>
          </div>
          <Badge variant="outline" className={styles.badge}>
            {levelText[recommendation.level]} · {styles.title}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm leading-6">
        <div className="grid gap-3 rounded-md bg-slate-50 p-3 sm:grid-cols-2">
          <div>
            <div className="text-xs text-muted-foreground">推荐专业</div>
            <div className="mt-1 font-medium text-foreground">
              {recommendation.major}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">数据状态</div>
            <div className="mt-1 flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className={
                  recommendation.isDemoData
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }
              >
                {recommendation.isDemoData ? "演示数据" : "真实来源"}
              </Badge>
              {recommendation.dataYear ? (
                <Badge variant="outline" className="bg-white">
                  {recommendation.dataYear} 年
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
        <InfoBlock
          title="数据来源"
          content={`${recommendation.sourceName} · ${recommendation.sourceUrl}`}
        />
        <InfoBlock title="匹配理由" content={recommendation.reason} />
        <InfoBlock title="风险提示" content={recommendation.risk} />
        <InfoBlock title="适合人群" content={recommendation.suitableFor} />
        <InfoBlock title="建议操作" content={recommendation.suggestion} />
      </CardContent>
    </Card>
  )
}

function InfoBlock({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground">{title}</div>
      <p className="mt-1 text-foreground/85">{content}</p>
    </div>
  )
}
