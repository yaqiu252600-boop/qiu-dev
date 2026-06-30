"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  Captions,
  CheckCircle2,
  Clipboard,
  Download,
  FileDown,
  FileText,
  Film,
  Link2,
  Loader2,
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type RequestState = "idle" | "loading" | "ready" | "error"

type VideoFormatOption = {
  id: string
  label: string
  quality: string
  ext: string
  sizeLabel: string
  height?: number
  fps?: number
}

type VideoInspectionResult = {
  title: string
  description: string
  uploader: string
  durationLabel: string
  webpageUrl: string
  transcript: {
    text: string
    language?: string
    source: "manual" | "automatic" | "metadata"
    available: boolean
  }
  copyText: string
  formats: VideoFormatOption[]
  notice: string
}

type VideoToolStatus = {
  available?: boolean
  mode?: "local" | "auto-download" | "unavailable"
  message?: string
}

function transcriptSourceText(source?: VideoInspectionResult["transcript"]["source"]) {
  if (source === "manual") {
    return "人工字幕"
  }

  if (source === "automatic") {
    return "自动字幕"
  }

  return "视频简介"
}

function downloadTextFile(title: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  const safeTitle = title.replace(/[\\/:*?"<>|]+/g, "-").slice(0, 60) || "video-copy"

  anchor.href = url
  anchor.download = `${safeTitle}.txt`
  anchor.click()
  URL.revokeObjectURL(url)
}

export function VideoToolsWorkbench() {
  const [url, setUrl] = useState("")
  const [submittedUrl, setSubmittedUrl] = useState("")
  const [state, setState] = useState<RequestState>("idle")
  const [message, setMessage] = useState("粘贴公开视频链接后开始解析。")
  const [status, setStatus] = useState<VideoToolStatus | null>(null)
  const [result, setResult] = useState<VideoInspectionResult | null>(null)
  const [selectedFormat, setSelectedFormat] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let mounted = true

    async function checkStatus() {
      try {
        const response = await fetch("/api/video-tools?status=1", {
          cache: "no-store",
        })
        const payload = (await response.json()) as VideoToolStatus

        if (!mounted) {
          return
        }

        setStatus(payload)
        if (!payload.available) {
          setState("error")
          setMessage(payload.message ?? "当前环境还没有可用的视频处理器。")
        }
      } catch {
        if (!mounted) {
          return
        }

        setStatus({
          available: false,
          mode: "unavailable",
          message: "无法确认视频处理器状态。",
        })
      }
    }

    checkStatus()

    return () => {
      mounted = false
    }
  }, [])

  const canSubmit = useMemo(
    () => Boolean(url.trim()) && state !== "loading" && status?.available !== false,
    [state, status?.available, url],
  )

  const copyText = result?.copyText ?? ""
  const transcriptText =
    result?.transcript.available && result.transcript.text
      ? result.transcript.text
      : result?.description ?? ""

  const downloadUrl =
    submittedUrl && selectedFormat
      ? `/api/video-tools?action=download&url=${encodeURIComponent(
          submittedUrl,
        )}&format=${encodeURIComponent(selectedFormat)}`
      : ""

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextUrl = url.trim()

    if (!nextUrl) {
      setState("error")
      setMessage("请输入视频链接。")
      return
    }

    setState("loading")
    setMessage(
      status?.mode === "auto-download"
        ? "正在准备视频处理器并解析链接，首次使用可能需要多等几秒。"
        : "正在解析视频链接。",
    )
    setResult(null)
    setSelectedFormat("")
    setCopied(false)

    try {
      const response = await fetch("/api/video-tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: nextUrl }),
      })
      const payload = (await response.json()) as VideoInspectionResult & {
        error?: string
      }

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "视频解析失败。")
      }

      setResult(payload)
      setSubmittedUrl(nextUrl)
      setSelectedFormat(payload.formats[0]?.id ?? "")
      setState("ready")
      setMessage("解析完成。")
    } catch (error) {
      setState("error")
      setMessage(error instanceof Error ? error.message : "视频解析失败。")
    }
  }

  async function handleCopy() {
    if (!copyText) {
      return
    }

    await navigator.clipboard.writeText(copyText)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="space-y-5">
      <Card className="bg-white">
        <CardHeader>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Film className="h-5 w-5" aria-hidden="true" />
          </div>
          <CardTitle>视频链接解析</CardTitle>
          <CardDescription>
            处理公开视频链接，返回可用文案和可下载的合并音视频清晰度。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <Link2 className="h-4 w-4 text-primary" aria-hidden="true" />
                视频链接
              </span>
              <input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://..."
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20"
              />
            </label>

            <div
              className={cn(
                "flex items-center gap-2 rounded-md border bg-background px-4 py-3 text-sm text-muted-foreground",
                state === "ready" && "border-emerald-200 bg-emerald-50 text-emerald-700",
                state === "error" && "border-red-200 bg-red-50 text-red-700",
              )}
            >
              {state === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : state === "ready" ? (
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              ) : state === "error" ? (
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Search className="h-4 w-4" aria-hidden="true" />
              )}
              <span>{message}</span>
            </div>

            <Button type="submit" disabled={!canSubmit}>
              {state === "loading" ? "解析中" : "开始解析"}
              <Search aria-hidden="true" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {result ? (
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="bg-white">
            <CardHeader>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <Captions className="h-5 w-5" aria-hidden="true" />
              </div>
              <CardTitle>文案提取</CardTitle>
              <CardDescription>
                {result.title}
                {result.uploader ? ` · ${result.uploader}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-md border bg-background p-3">
                  <div className="text-muted-foreground">时长</div>
                  <div className="mt-1 font-medium text-foreground">
                    {result.durationLabel}
                  </div>
                </div>
                <div className="rounded-md border bg-background p-3">
                  <div className="text-muted-foreground">文本来源</div>
                  <div className="mt-1 font-medium text-foreground">
                    {transcriptSourceText(result.transcript.source)}
                  </div>
                </div>
                <div className="rounded-md border bg-background p-3">
                  <div className="text-muted-foreground">语言</div>
                  <div className="mt-1 font-medium text-foreground">
                    {result.transcript.language ?? "未标注"}
                  </div>
                </div>
              </div>

              <textarea
                readOnly
                value={transcriptText || "这个视频没有可提取的公开字幕或简介。"}
                className="min-h-[320px] w-full resize-y rounded-md border border-input bg-background p-4 text-sm leading-6 outline-none"
              />

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="button" onClick={handleCopy} disabled={!copyText}>
                  <Clipboard aria-hidden="true" />
                  {copied ? "已复制" : "复制文案"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => downloadTextFile(result.title, copyText)}
                  disabled={!copyText}
                >
                  <FileDown aria-hidden="true" />
                  导出 TXT
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <Download className="h-5 w-5" aria-hidden="true" />
              </div>
              <CardTitle>视频下载</CardTitle>
              <CardDescription>{result.notice}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
                  清晰度
                </span>
                <select
                  value={selectedFormat}
                  onChange={(event) => setSelectedFormat(event.target.value)}
                  disabled={result.formats.length === 0}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/20 disabled:opacity-60"
                >
                  {result.formats.length > 0 ? (
                    result.formats.map((format) => (
                      <option key={format.id} value={format.id}>
                        {format.label}
                      </option>
                    ))
                  ) : (
                    <option value="">没有可直接下载的清晰度</option>
                  )}
                </select>
              </label>

              <div className="rounded-md border bg-background p-4 text-sm leading-6 text-muted-foreground">
                {selectedFormat ? (
                  <span>
                    已选择{" "}
                    <span className="font-medium text-foreground">
                      {result.formats.find((format) => format.id === selectedFormat)
                        ?.label ?? "当前清晰度"}
                    </span>
                    。下载会生成临时文件，较大的视频可能需要等待。
                  </span>
                ) : (
                  <span>
                    当前链接没有公开的合并音视频格式，可能需要平台登录态、分段流或额外合成。
                  </span>
                )}
              </div>

              {downloadUrl ? (
                <Button asChild>
                  <a href={downloadUrl}>
                    <Download aria-hidden="true" />
                    下载所选清晰度
                  </a>
                </Button>
              ) : (
                <Button type="button" disabled>
                  <Download aria-hidden="true" />
                  下载所选清晰度
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
