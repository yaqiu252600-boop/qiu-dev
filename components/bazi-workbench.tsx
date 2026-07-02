"use client"

import { useMemo, useState } from "react"
import { FileDown, Lock, Share2, Sparkles } from "lucide-react"

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
  monetization: {
    paidEnabled: boolean
    baziPriceCny: string
    namePriceCny: string
    auspiciousDatePriceCny: string
    status: string
  }
  disclaimer: string
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
    return `八字排盘文化参考\n日主：${result.dayMaster.stem}${result.dayMaster.element}\n四柱：${result.pillars.year} ${result.pillars.month} ${result.pillars.day} ${result.pillars.hour}\n五行参考：${elementLabels.map(([key, label]) => `${label}${result.fiveElements[key]}`).join(" / ")}\n仅供娱乐参考。`
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
                    <CardTitle className="text-2xl">八字排盘文化参考报告</CardTitle>
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

            <MonetizationPreview result={result} />
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
          {result.dayMaster.description}仅供娱乐参考。
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
      <p className="mt-5 text-center text-xs text-muted-foreground">
        传统文化娱乐参考，不构成现实决策建议。
      </p>
    </div>
  )
}

function MonetizationPreview({ result }: { result: BaziResult }) {
  const paidStatus = result.monetization.paidEnabled ? "内测中" : "即将开放"
  const paidItems = [
    "详细性格报告",
    "事业方向报告",
    "感情相处参考",
    "财富观念参考",
    "流年简析",
    "PDF 报告增强版",
    "分享海报下载",
  ]
  const relatedProducts = [
    { title: "八字详细报告", price: result.monetization.baziPriceCny },
    { title: "取名详细报告", price: result.monetization.namePriceCny },
    { title: "吉日专项报告", price: result.monetization.auspiciousDatePriceCny },
  ]

  return (
    <Card className="bg-white print:hidden">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>详细报告</CardTitle>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              第一版先展示价格与功能范围，不接真实支付平台，不写入支付状态。
            </p>
          </div>
          <Badge variant="outline" className="w-fit bg-white">
            {paidStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-md border border-border p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-lg font-semibold">八字详细报告</div>
              <div className="mt-1 text-sm text-muted-foreground">
                ¥{result.monetization.baziPriceCny} · {result.monetization.status}
              </div>
            </div>
            <Button type="button" disabled>
              <Lock aria-hidden="true" />
              解锁详细报告
            </Button>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {paidItems.map((item) => (
              <div key={item} className="rounded-md bg-background p-3 text-sm text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {relatedProducts.map((item) => (
            <div key={item.title} className="rounded-md bg-background p-4">
              <div className="font-medium">{item.title}</div>
              <div className="mt-2 text-2xl font-semibold">¥{item.price}</div>
              <div className="mt-2 text-sm text-muted-foreground">展示入口，功能即将开放</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
