"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type NameSuggestion = {
  name: string
  givenName: string
  pinyin: string
  meaning: string
  elements: string
  implication: string
  tags: string[]
  reason: string
}

const inputClass =
  "h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
const labelClass = "space-y-2 text-sm font-medium"

export function NameRecommendationWorkbench() {
  const [result, setResult] = useState<NameSuggestion[]>([])
  const [note, setNote] = useState("第一版不会保存姓氏、出生日期、出生时间等输入信息。")
  const [form, setForm] = useState({
    surname: "",
    gender: "不透露",
    birthDate: "",
    birthTime: "",
    nameLength: "双字",
    style: "寓意好",
    useFiveElements: true,
    avoidChars: "",
    generationChar: "",
  })

  function updateField(key: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function submit() {
    setNote("正在生成名字灵感")
    const response = await fetch("/api/name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = (await response.json()) as {
      suggestions?: NameSuggestion[]
      note?: string
      error?: string
    }
    if (!response.ok) {
      setNote(data.error ?? "生成失败，请检查输入")
      return
    }
    setResult(data.suggestions ?? [])
    setNote(data.note ?? "已生成名字灵感")
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>取名推荐</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            生成结果仅作为名字灵感、文化参考和寓意参考。
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className={labelClass}>
            姓氏
            <input
              className={inputClass}
              value={form.surname}
              maxLength={2}
              onChange={(event) => updateField("surname", event.target.value)}
              placeholder="例如：林"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
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
            <label className={labelClass}>
              名字字数
              <select
                className={inputClass}
                value={form.nameLength}
                onChange={(event) => updateField("nameLength", event.target.value)}
              >
                <option>单字</option>
                <option>双字</option>
              </select>
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              出生日期
              <input
                className={inputClass}
                type="date"
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
          <label className={labelClass}>
            风格
            <select
              className={inputClass}
              value={form.style}
              onChange={(event) => updateField("style", event.target.value)}
            >
              {["古风", "大气", "温柔", "诗意", "现代", "寓意好"].map((style) => (
                <option key={style}>{style}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-3 rounded-md border border-border p-3 text-sm">
            <input
              type="checkbox"
              checked={form.useFiveElements}
              onChange={(event) => updateField("useFiveElements", event.target.checked)}
            />
            是否结合五行文化参考
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              避开用字
              <input
                className={inputClass}
                value={form.avoidChars}
                onChange={(event) => updateField("avoidChars", event.target.value)}
                placeholder="例如：轩、梓"
              />
            </label>
            <label className={labelClass}>
              指定辈分字
              <input
                className={inputClass}
                value={form.generationChar}
                maxLength={1}
                onChange={(event) => updateField("generationChar", event.target.value)}
                placeholder="可选"
              />
            </label>
          </div>
          <Button type="button" onClick={submit} className="w-full">
            <Sparkles aria-hidden="true" />
            生成 20 个名字灵感
          </Button>
          <p className="text-sm leading-6 text-muted-foreground">{note}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {result.length ? (
          result.map((item) => (
            <Card key={item.name} className="bg-white">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="text-2xl">{item.name}</CardTitle>
                    <p className="mt-2 text-sm text-muted-foreground">{item.pinyin}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="bg-white">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
                <ResultLine title="字义解释" text={item.meaning} />
                <ResultLine title="五行属性" text={item.elements} />
                <ResultLine title="寓意" text={item.implication} />
                <ResultLine title="推荐理由" text={item.reason} />
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-white">
            <CardContent className="p-8 text-sm leading-6 text-muted-foreground">
              填写偏好后生成第一版 20 个名字灵感。结果不会保存到数据库，也不会打印完整出生信息。
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function ResultLine({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-md bg-background p-4">
      <div className="font-medium text-foreground">{title}</div>
      <p className="mt-2">{text}</p>
    </div>
  )
}
