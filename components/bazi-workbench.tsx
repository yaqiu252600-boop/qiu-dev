"use client"

import { useMemo, useState } from "react"
import { FileDown, Share2, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type FiveElements = {
  wood: number
  fire: number
  earth: number
  metal: number
  water: number
}

type BaziResult = {
  ok: true
  inputSummary: {
    calendarType: string
    gender: string
    cityProvided: boolean
    trueSolarTime: boolean
    privacy: string
  }
  pillars: {
    year: string
    month: string
    day: string
    hour: string
  }
  stemsBranches: {
    yearStem: string
    yearBranch: string
    monthStem: string
    monthBranch: string
    dayStem: string
    dayBranch: string
    hourStem: string
    hourBranch: string
  }
  zodiac: string
  fiveElements: FiveElements
  fiveElementText: string
  tenGods: {
    stems: Record<"year" | "month" | "day" | "hour", string>
    branches: Record<"year" | "month" | "day" | "hour", string>
  }
  hiddenStems: Record<"year" | "month" | "day" | "hour", string[]>
  naYin: Record<"year" | "month" | "day" | "hour", string>
  dayMaster: {
    stem: string
    element: string
    description: string
  }
  summary: string
  analysis: {
    personality: string
    career: string
    relationship: string
    wealth: string
    yearly: string
    communication: string
    life: string
    nodes: {
      peachBranch: string
      spouseSignalCount: number
      childSignalCount: number
      childSignalText: string
      spouseSignalText: string
      relationshipNodes: NodeSignal[]
      stableNodes: NodeSignal[]
      careerNodes: NodeSignal[]
      directWealthNodes: NodeSignal[]
      windfallWealthNodes: NodeSignal[]
      wealthCount: number
    }
    wealthProfile: {
      directWealthCount: number
      windfallWealthCount: number
      totalWealthCount: number
      directWealthRatio: number
      windfallWealthRatio: number
    }
  }
  disclaimer: string
}

type NodeSignal = {
  year: number
  ganZhi: string
  age: number
  level: "强" | "中" | "弱"
  label: string
  reason: string
}

const inputClass =
  "h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:bg-secondary disabled:text-muted-foreground"
const labelClass = "space-y-2 text-sm font-medium"
const pillarLabels = [
  ["year", "年柱"],
  ["month", "月柱"],
  ["day", "日柱"],
  ["hour", "时柱"],
] as const
const elementLabels: Array<[keyof FiveElements, string]> = [
  ["wood", "木"],
  ["fire", "火"],
  ["earth", "土"],
  ["metal", "金"],
  ["water", "水"],
]

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function BaziWorkbench() {
  const [result, setResult] = useState<BaziResult | null>(null)
  const [message, setMessage] = useState("本工具默认不保存你的出生信息。")
  const [shareCopied, setShareCopied] = useState(false)
  const [form, setForm] = useState({
    birthDate: "",
    birthTime: "",
    calendarType: "solar",
    gender: "不透露",
    birthCity: "",
    useTrueSolarTime: false,
  })

  function updateField(key: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function submit() {
    setMessage("正在排盘")
    setShareCopied(false)
    const response = await fetch("/api/bazi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = (await response.json()) as BaziResult | { ok: false; error?: string }
    if (!response.ok || !data.ok) {
      setMessage("error" in data && data.error ? data.error : "排盘失败，请检查输入")
      return
    }
    setResult(data)
    setMessage(data.inputSummary.privacy)
  }

  const shareText = useMemo(() => {
    if (!result) return ""
    return `八字排盘文化参考\n日主：${result.dayMaster.stem}${result.dayMaster.element}\n四柱：${result.pillars.year} ${result.pillars.month} ${result.pillars.day} ${result.pillars.hour}\n五行参考：${elementLabels.map(([key, label]) => `${label}${result.fiveElements[key]}`).join(" / ")}`
  }, [result])

  async function copyShareText() {
    if (!shareText) return
    await navigator.clipboard.writeText(shareText)
    setShareCopied(true)
  }

  function exportPdf() {
    if (!result) return
    const currentTitle = document.title
    document.title = "bazi-report"
    window.print()
    window.setTimeout(() => {
      document.title = currentTitle
    }, 500)
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
      <Card className="bg-white print:hidden">
        <CardHeader>
          <CardTitle>八字排盘工具</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            输入出生日期时间，生成四柱八字、五行分布、十神关系与传统命理文化解读。
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              出生日期
              <input
                className={inputClass}
                type="date"
                max={today()}
                value={form.birthDate}
                onChange={(event) => updateField("birthDate", event.target.value)}
              />
            </label>
            <label className={labelClass}>
              出生时间
              <input
                className={inputClass}
                type="time"
                value={form.birthTime}
                onChange={(event) => updateField("birthTime", event.target.value)}
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              历法类型
              <select
                className={inputClass}
                value={form.calendarType}
                onChange={(event) => updateField("calendarType", event.target.value)}
              >
                <option value="solar">阳历</option>
                <option value="lunar" disabled>
                  阴历，即将支持
                </option>
              </select>
            </label>
            <label className={labelClass}>
              性别
              <select
                className={inputClass}
                value={form.gender}
                onChange={(event) => updateField("gender", event.target.value)}
              >
                <option>男</option>
                <option>女</option>
                <option>不透露</option>
              </select>
            </label>
          </div>
          <label className={labelClass}>
            出生城市
            <input
              className={inputClass}
              value={form.birthCity}
              onChange={(event) => updateField("birthCity", event.target.value)}
              placeholder="可选，仅用于后续真太阳时功能"
            />
          </label>
          <label className="flex items-start gap-3 rounded-md border border-border p-3 text-sm">
            <input
              className="mt-1"
              type="checkbox"
              disabled
              checked={form.useTrueSolarTime}
              onChange={(event) => updateField("useTrueSolarTime", event.target.checked)}
            />
            <span>
              是否使用真太阳时
              <span className="mt-1 block text-muted-foreground">高级功能即将支持，第一版默认关闭。</span>
            </span>
          </label>
          <Button type="button" onClick={submit} className="w-full">
            <Sparkles aria-hidden="true" />
            生成八字排盘
          </Button>
          <p className="rounded-md bg-background p-3 text-sm leading-6 text-muted-foreground">
            {message}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-5">
        {result ? (
          <>
            <Card className="bg-white" id="bazi-report">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="text-2xl">八字排盘完整分析</CardTitle>
                    <p className="mt-2 text-sm text-muted-foreground">
                      生肖：{result.zodiac} · 日主：{result.dayMaster.stem}
                      {result.dayMaster.element}
                    </p>
                  </div>
                  <Badge className="w-fit">仅供娱乐参考</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-4">
                  {pillarLabels.map(([key, label]) => (
                    <div key={key} className="rounded-md border border-border p-4 text-center">
                      <div className="text-sm text-muted-foreground">{label}</div>
                      <div className="mt-2 text-2xl font-semibold text-primary">
                        {result.pillars[key]}
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        纳音：{result.naYin[key]}
                      </div>
                    </div>
                  ))}
                </div>

                <SectionTitle title="天干地支拆解" />
                <div className="grid gap-3 sm:grid-cols-4">
                  {pillarLabels.map(([key, label]) => (
                    <InfoBlock
                      key={key}
                      title={label}
                      text={`天干 ${result.stemsBranches[`${key}Stem`]} · 地支 ${result.stemsBranches[`${key}Branch`]}`}
                    />
                  ))}
                </div>

                <SectionTitle title="五行统计" />
                <div className="grid gap-3 sm:grid-cols-5">
                  {elementLabels.map(([key, label]) => (
                    <div key={key} className="rounded-md bg-background p-4">
                      <div className="text-sm text-muted-foreground">{label}</div>
                      <div className="mt-2 text-2xl font-semibold">{result.fiveElements[key]}</div>
                    </div>
                  ))}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{result.fiveElementText}</p>

                <SectionTitle title="十神关系" />
                <div className="grid gap-3 sm:grid-cols-2">
                  {pillarLabels.map(([key, label]) => (
                    <InfoBlock
                      key={key}
                      title={label}
                      text={`天干：${result.tenGods.stems[key]}；地支：${result.tenGods.branches[key]}；藏干：${result.hiddenStems[key].join("、") || "暂无"}`}
                    />
                  ))}
                </div>

                <SectionTitle title="日主说明" />
                <p className="rounded-md bg-background p-4 text-sm leading-6 text-muted-foreground">
                  {result.dayMaster.description}
                </p>

                <SectionTitle title="基础文化解读" />
                <div className="space-y-3 rounded-md border border-border p-4 text-sm leading-7 text-muted-foreground">
                  {result.summary.split("\n\n").map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>

                <SectionTitle title="性格分析" />
                <AnalysisBlock text={result.analysis.personality} />

                <SectionTitle title="事业方向分析" />
                <AnalysisBlock text={result.analysis.career} />

                <SectionTitle title="感情相处分析" />
                <AnalysisBlock text={result.analysis.relationship} />
                <div className="grid gap-4 md:grid-cols-2">
                  <SignalBlock
                    title={`桃花窗口，桃花位 ${result.analysis.nodes.peachBranch}`}
                    items={result.analysis.nodes.relationshipNodes}
                    empty="未来 16 年桃花信号不集中。"
                  />
                  <SignalBlock
                    title="常伴良人 / 稳定关系窗口"
                    items={result.analysis.nodes.stableNodes}
                    empty="未来 16 年稳定关系窗口不集中。"
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <InfoBlock
                    title="伴侣星信号"
                    text={`原局伴侣星出现 ${result.analysis.nodes.spouseSignalCount} 处。${result.analysis.nodes.spouseSignalText}`}
                  />
                  <InfoBlock
                    title="子女缘 / 作品输出信号"
                    text={`原局子女缘/作品输出信号出现 ${result.analysis.nodes.childSignalCount} 处。${result.analysis.nodes.childSignalText}`}
                  />
                </div>

                <SectionTitle title="财富观念分析" />
                <AnalysisBlock text={result.analysis.wealth} />
                <div className="grid gap-3 md:grid-cols-3">
                  <InfoBlock
                    title="财星总量"
                    text={`原局财星共 ${result.analysis.wealthProfile.totalWealthCount} 处。`}
                  />
                  <InfoBlock
                    title="正财占比"
                    text={`${result.analysis.wealthProfile.directWealthRatio}% · ${result.analysis.wealthProfile.directWealthCount} 处，偏稳定收入、合同回款和长期经营。`}
                  />
                  <InfoBlock
                    title="偏财占比"
                    text={`${result.analysis.wealthProfile.windfallWealthRatio}% · ${result.analysis.wealthProfile.windfallWealthCount} 处，偏项目机会、资源流动和副业外快。`}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <SignalBlock
                    title="正财节点"
                    items={result.analysis.nodes.directWealthNodes}
                    empty="未来 16 年正财节点不集中。"
                  />
                  <SignalBlock
                    title="偏财 / 机会财节点"
                    items={result.analysis.nodes.windfallWealthNodes}
                    empty="未来 16 年偏财节点不集中。"
                  />
                </div>

                <SectionTitle title="事业节点" />
                <SignalBlock
                  title="事业变动 / 突破窗口"
                  items={result.analysis.nodes.careerNodes}
                  empty="未来 16 年事业节点不集中。"
                />

                <SectionTitle title="流年简析" />
                <AnalysisBlock text={result.analysis.yearly} />

                <SectionTitle title="沟通提醒" />
                <AnalysisBlock text={result.analysis.communication} />

                <SectionTitle title="生活建议" />
                <AnalysisBlock text={result.analysis.life} />
              </CardContent>
            </Card>

            <Card className="bg-white print:hidden">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>报告与分享</CardTitle>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button type="button" variant="outline" onClick={exportPdf}>
                      <FileDown aria-hidden="true" />
                      导出 PDF 报告
                    </Button>
                    <Button type="button" variant="outline" onClick={copyShareText}>
                      <Share2 aria-hidden="true" />
                      复制分享文案
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {shareCopied ? (
                  <p className="rounded-md bg-background p-3 text-sm text-muted-foreground">
                    分享文案已复制。
                  </p>
                ) : null}
                <SharePreview result={result} />
              </CardContent>
            </Card>

          </>
        ) : (
          <Card className="bg-white">
            <CardContent className="p-8 text-sm leading-6 text-muted-foreground">
              填写出生日期和出生时间后生成排盘。第一版完整支持阳历；阴历和真太阳时属于后续高级功能。
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function SectionTitle({ title }: { title: string }) {
  return <h3 className="text-base font-semibold text-foreground">{title}</h3>
}

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-md bg-background p-4">
      <div className="font-medium">{title}</div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  )
}

function AnalysisBlock({ text }: { text: string }) {
  return (
    <div className="space-y-3 rounded-md border border-border bg-white p-4 text-sm leading-7 text-muted-foreground">
      {text.split("\n\n").map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  )
}

function SignalBlock({
  title,
  items,
  empty,
}: {
  title: string
  items: NodeSignal[]
  empty: string
}) {
  return (
    <div className="rounded-md border border-border bg-white p-4">
      <div className="font-medium">{title}</div>
      {items.length ? (
        <div className="mt-3 space-y-3">
          {items.map((item) => (
            <div key={`${title}-${item.year}-${item.label}`} className="rounded-md bg-background p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={item.level === "强" ? "default" : "outline"}>
                  {item.level}
                </Badge>
                <span className="font-medium">
                  {item.year} 年 {item.ganZhi} · {item.age} 岁
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.reason}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
      )}
    </div>
  )
}

function SharePreview({ result }: { result: BaziResult }) {
  return (
    <div className="rounded-lg border border-primary/20 bg-accent p-5">
      <div className="flex items-center justify-between gap-3">
        <Badge>qiu.dev</Badge>
        <span className="text-xs text-muted-foreground">
          {new Date().toLocaleDateString("zh-CN")}
        </span>
      </div>
      <div className="mt-6 text-center">
        <div className="text-sm text-muted-foreground">日主</div>
        <div className="mt-2 text-3xl font-semibold text-primary">
          {result.dayMaster.stem}
          {result.dayMaster.element}
        </div>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7">
          {result.dayMaster.description}
        </p>
      </div>
      <div className="mt-6 grid grid-cols-4 gap-2 text-center text-sm">
        {pillarLabels.map(([key, label]) => (
          <div key={key} className="rounded-md bg-white p-3">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="mt-1 font-medium">{result.pillars[key]}</div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-center text-xs text-muted-foreground">qiu.dev 八字排盘</p>
    </div>
  )
}
