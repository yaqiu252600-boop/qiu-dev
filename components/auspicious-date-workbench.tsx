"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type AuspiciousDate = {
  date: string
  lunarDate: string
  weekday: string
  goodFor: string[]
  avoid: string[]
  clash: string
  goodGods: string[]
  score: number
  reason: string
}

const inputClass =
  "h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
const labelClass = "space-y-2 text-sm font-medium"

function defaultEndDate() {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date.toISOString().slice(0, 10)
}

export function AuspiciousDateWorkbench() {
  const [dates, setDates] = useState<AuspiciousDate[]>([])
  const [message, setMessage] = useState("选择事项和日期范围后查询传统黄历参考日期。")
  const [form, setForm] = useState({
    matter: "结婚",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: defaultEndDate(),
    zodiac: "",
    weekendsOnly: false,
    avoidClash: true,
  })

  function updateField(key: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function submit() {
    setMessage("正在查询")
    const response = await fetch("/api/auspicious-date", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = (await response.json()) as {
      dates?: AuspiciousDate[]
      note?: string
      warning?: string
      error?: string
    }
    if (!response.ok) {
      setMessage(data.error ?? "查询失败，请检查输入")
      return
    }
    setDates(data.dates ?? [])
    setMessage(data.warning ?? data.note ?? "已生成参考日期")
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>良辰吉日</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            支持结婚、搬家、开业、领证、装修、入宅、签约、出行等民俗场景。
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className={labelClass}>
            事项类型
            <select
              className={inputClass}
              value={form.matter}
              onChange={(event) => updateField("matter", event.target.value)}
            >
              {["结婚", "搬家", "开业", "领证", "装修", "入宅", "签约", "出行"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              开始日期
              <input
                className={inputClass}
                type="date"
                value={form.startDate}
                onChange={(event) => updateField("startDate", event.target.value)}
              />
            </label>
            <label className={labelClass}>
              结束日期
              <input
                className={inputClass}
                type="date"
                value={form.endDate}
                onChange={(event) => updateField("endDate", event.target.value)}
              />
            </label>
          </div>
          <label className={labelClass}>
            生肖
            <select
              className={inputClass}
              value={form.zodiac}
              onChange={(event) => updateField("zodiac", event.target.value)}
            >
              <option value="">不选择</option>
              {["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-3 rounded-md border border-border p-3 text-sm">
            <input
              type="checkbox"
              checked={form.weekendsOnly}
              onChange={(event) => updateField("weekendsOnly", event.target.checked)}
            />
            是否只看周末
          </label>
          <label className="flex items-center gap-3 rounded-md border border-border p-3 text-sm">
            <input
              type="checkbox"
              checked={form.avoidClash}
              onChange={(event) => updateField("avoidClash", event.target.checked)}
            />
            是否避开冲煞
          </label>
          <Button type="button" onClick={submit} className="w-full">
            <Search aria-hidden="true" />
            查询参考日期
          </Button>
          <p className="rounded-md bg-background p-3 text-sm leading-6 text-muted-foreground">
            {message}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {dates.length ? (
          dates.map((item) => (
            <Card key={item.date} className="bg-white">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="text-2xl">{item.date}</CardTitle>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.weekday} · {item.lunarDate}
                    </p>
                  </div>
                  <Badge className="w-fit">推荐指数 {item.score}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-muted-foreground">{item.reason}</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <TermBlock title="宜" items={item.goodFor} />
                  <TermBlock title="忌" items={item.avoid} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoBlock title="冲煞" text={item.clash} />
                  <TermBlock title="吉神信息" items={item.goodGods} />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-white">
            <CardContent className="p-8 text-sm leading-6 text-muted-foreground">
              暂无结果。可放宽日期范围、取消“只看周末”或关闭冲煞过滤后再试。
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function TermBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md bg-background p-4">
      <h3 className="font-medium">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length ? (
          items.map((item) => (
            <Badge key={item} variant="outline" className="bg-white">
              {item}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">暂无明确信息</span>
        )}
      </div>
    </div>
  )
}

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-md bg-background p-4">
      <h3 className="font-medium">{title}</h3>
      <p className="mt-3 text-sm text-muted-foreground">{text}</p>
    </div>
  )
}
