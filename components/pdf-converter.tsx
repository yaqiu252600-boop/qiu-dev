"use client"

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react"
import { CheckCircle2, Download, FileText, Loader2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type ConvertState = "idle" | "ready" | "converting" | "done" | "error"
type ServiceState = "checking" | "available" | "unavailable"

function fileNameFromDisposition(header: string | null) {
  if (!header) {
    return ""
  }

  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i)
  const asciiMatch = header.match(/filename="?([^";]+)"?/i)
  const value = utf8Match?.[1] ?? asciiMatch?.[1]

  return value ? decodeURIComponent(value) : ""
}

export function PdfConverter() {
  const [file, setFile] = useState<File | null>(null)
  const [state, setState] = useState<ConvertState>("idle")
  const [message, setMessage] = useState("请选择一个 PDF 文件")
  const [serviceState, setServiceState] = useState<ServiceState>("checking")
  const [downloadName, setDownloadName] = useState("")

  const canConvert = useMemo(
    () => Boolean(file) && state !== "converting" && serviceState === "available",
    [file, serviceState, state],
  )

  useEffect(() => {
    let mounted = true

    async function checkService() {
      try {
        const response = await fetch("/api/pdf-to-word?status=1", {
          cache: "no-store",
        })
        const result = (await response.json()) as {
          available?: boolean
          message?: string
        }

        if (!mounted) {
          return
        }

        setServiceState(result.available ? "available" : "unavailable")
        setMessage(result.message ?? "请选择一个 PDF 文件")
        setState(result.available ? "idle" : "error")
      } catch {
        if (!mounted) {
          return
        }

        setServiceState("unavailable")
        setState("error")
        setMessage("暂时无法连接转换服务，请稍后再试。")
      }
    }

    checkService()

    return () => {
      mounted = false
    }
  }, [])

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]
    setDownloadName("")

    if (!selected) {
      setFile(null)
      setState(serviceState === "available" ? "idle" : "error")
      setMessage(serviceState === "available" ? "请选择一个 PDF 文件" : "转换服务暂不可用。")
      return
    }

    const isPdf = selected.type === "application/pdf" || selected.name.toLowerCase().endsWith(".pdf")

    if (!isPdf) {
      setFile(null)
      setState("error")
      setMessage("只支持 PDF 文件。")
      return
    }

    setFile(selected)
    setState(serviceState === "available" ? "ready" : "error")
    setMessage(
      serviceState === "available"
        ? `${selected.name} 已准备好`
        : "转换服务暂不可用，请稍后再试。",
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!file) {
      setState("error")
      setMessage("请先上传 PDF 文件。")
      return
    }

    setState("converting")
    setMessage("正在转换，文本型 PDF 通常只需要几秒钟。")
    setDownloadName("")

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/pdf-to-word", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(result?.error ?? "转换失败，请换一个 PDF 再试。")
      }

      const blob = await response.blob()
      const name =
        fileNameFromDisposition(response.headers.get("content-disposition")) ??
        `${file.name.replace(/\.pdf$/i, "") || "converted"}.docx`
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = name
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)

      setDownloadName(name)
      setState("done")
      setMessage(`转换完成，已生成 ${name}`)
    } catch (error) {
      setState("error")
      setMessage(error instanceof Error ? error.message : "转换失败，请换一个 PDF 再试。")
    }
  }

  return (
    <Card className="mx-auto max-w-3xl bg-white">
      <CardHeader>
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <FileText className="h-5 w-5" aria-hidden="true" />
        </div>
        <CardTitle>PDF 转 Word</CardTitle>
        <CardDescription>
          上传文本型 PDF 后，在线生成可编辑的 Word 文件。扫描件图片版暂不支持 OCR。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <label
            className={cn(
              "flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-background px-6 py-8 text-center transition-colors hover:border-primary/50 hover:bg-accent/50",
              state === "error" && "border-red-200 bg-red-50",
            )}
          >
            <Upload className="mb-3 h-6 w-6 text-primary" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground">
              {file ? file.name : "上传 PDF 文件"}
            </span>
            <span className="mt-2 text-sm text-muted-foreground">
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "最大 15MB"}
            </span>
            <input
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>

          <div
            className={cn(
              "flex items-center gap-2 rounded-md border bg-background px-4 py-3 text-sm text-muted-foreground",
              state === "done" && "border-emerald-200 bg-emerald-50 text-emerald-700",
              state === "error" && "border-red-200 bg-red-50 text-red-700",
            )}
          >
            {state === "converting" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : state === "done" ? (
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <FileText className="h-4 w-4" aria-hidden="true" />
            )}
            <span>
              {serviceState === "checking" ? "正在检查转换服务状态..." : message}
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={!canConvert}>
              {state === "converting" ? "转换中" : "开始转换"}
            </Button>
            {downloadName ? (
              <Button type="button" variant="outline" disabled>
                <Download aria-hidden="true" />
                已下载 Word
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
