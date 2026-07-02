"use client"

import { useEffect, useMemo, useState } from "react"
import { RefreshCw, Share2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type DailyFortune = {
  date: string
  lunarDate: string
  ganZhi: string
  signText: string
  signPosition: string
  keyword: string
  goodFor: string[]
  avoid: string[]
  careerTip: string
  relationshipTip: string
  wealthTip: string
  healthTip: string
  luckyColor: string
  luckyNumber: number
}

export function DailyFortuneWorkbench() {
  const [fortune, setFortune] = useState<DailyFortune | null>(null)
  const [status, setStatus] = useState("生成今日签文")

  async function loadFortune() {
    setStatus("正在生成")
    const response = await fetch("/api/daily-fortune", { cache: "no-store" })
    const data = (await response.json()) as DailyFortune
    setFortune(data)
    setStatus("今日签文已生成")
  }

  useEffect(() => {
    loadFortune().catch(() => setStatus("生成失败，请稍后再试"))
  }, [])

  const shareText = useMemo(() => {
    if (!fortune) return ""
    return `每日一签｜${fortune.signPosition}\n${fortune.signText}\n关键词：${fortune.keyword}\n幸运色：${fortune.luckyColor}，幸运数字：${fortune.luckyNumber}\n仅供传统文化娱乐参考。`
  }, [fortune])

  async function shareResult() {
    if (!shareText) return
    if (navigator.share) {
      await navigator.share({ title: "每日一签", text: shareText })
      return
    }
    await navigator.clipboard.writeText(shareText)
    setStatus("分享文案已复制")
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.72fr]">
      <Card className="bg-white">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl">每日一签</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                日期种子生成，同一天结果相对稳定。
              </p>
            </div>
            <Button onClick={() => loadFortune()} type="button">
              <RefreshCw aria-hidden="true" />
              生成今日签
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-md border border-border bg-background p-4 text-sm text-muted-foreground">
            {status}
          </div>
          {fortune ? (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <InfoBlock label="签位" value={fortune.signPosition} />
                <InfoBlock label="关键词" value={fortune.keyword} />
                <InfoBlock label="农历" value={fortune.lunarDate} />
              </div>
              <div className="rounded-md border border-border p-5">
                <p className="text-lg font-medium leading-8">{fortune.signText}</p>
                <p className="mt-3 text-sm text-muted-foreground">{fortune.ganZhi}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <ListBlock title="今日宜" items={fortune.goodFor} />
                <ListBlock title="今日忌" items={fortune.avoid} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TipBlock title="事业提醒" text={fortune.careerTip} />
                <TipBlock title="感情提醒" text={fortune.relationshipTip} />
                <TipBlock title="财富提醒" text={fortune.wealthTip} />
                <TipBlock title="健康生活提醒" text={fortune.healthTip} />
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>分享卡片</CardTitle>
            <Button variant="outline" size="sm" onClick={shareResult} type="button">
              <Share2 aria-hidden="true" />
              分享
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {fortune ? (
            <div className="rounded-lg border border-primary/20 bg-accent p-5">
              <div className="flex items-center justify-between gap-3">
                <Badge>传统文化娱乐参考</Badge>
                <span className="text-sm text-muted-foreground">{fortune.date}</span>
              </div>
              <div className="mt-8 text-center">
                <div className="text-sm text-muted-foreground">今日签位</div>
                <div className="mt-2 text-3xl font-semibold text-primary">
                  {fortune.signPosition}
                </div>
                <p className="mx-auto mt-5 max-w-sm text-base leading-8">
                  {fortune.signText}
                </p>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-3 text-center text-sm">
                <InfoBlock label="关键词" value={fortune.keyword} />
                <InfoBlock label="幸运色" value={fortune.luckyColor} />
                <InfoBlock label="幸运数" value={`${fortune.luckyNumber}`} />
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium text-foreground">{value}</div>
    </div>
  )
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-border p-4">
      <h3 className="font-medium">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item} variant="outline" className="bg-white">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  )
}

function TipBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-md bg-background p-4">
      <h3 className="font-medium">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  )
}
