"use client"

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react"
import { CheckCircle2, Download, FileText, Upload } from "lucide-react"

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
type EngineState = "checking" | "available" | "unavailable"

export function PdfConverter() {
  const [file, setFile] = useState<File | null>(null)
  const [state, setState] = useState<ConvertState>("idle")
  const [message, setMessage] = useState("请选择一个 PDF 文件")
  const [downloadUrl, setDownloadUrl] = useState("")
  const [downloadName, setDownloadName] = useState("")
  const [engineState, setEngineState] = useState<EngineState>("checking")

  const canConvert = useMemo(
    () => Boolean(file) && state !== "converting" && engineState === "available",
    [engineState, file, state],
  )

  useEffect(() => {
    let mounted = true

    async function checkEngine() {
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

        setEngineState(result.available ? "available" : "unavailable")

        if (!result.available) {
          setState("error")
          setMessage(
            result.message ??
              "当前环境未配置 PDF 转 Word 转换引擎，线上暂不能直接转换。",
          )
        }
      } catch {
        if (!mounted) {
          return
        }

        setEngineState("unavailable")
        setState("error")
        setMessage("无法确认转换引擎状态，暂不能开始转换。")
      }
    }

    checkEngine()

    return () => {
      mounted = false
    }
  }, [])

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]
    setDownloadUrl("")
    setDownloadName("")

    if (!selected) {
      setFile(null)
      setState(engineState === "unavailable" ? "error" : "idle")
      setMessage(
        engineState === "unavailable"
          ? "当前环境未配置 PDF 转 Word 转换引擎，线上暂不能直接转换。"
          : "请选择一个 PDF 文件",
      )
      return
    }

    const isPdf = selected.type === "application/pdf" || selected.name.toLowerCase().endsWith(".pdf")

    if (!isPdf) {
      setFile(null)
      setState("error")
      setMessage("只支持 PDF 文件")
      return
    }

    setFile(selected)
    if (engineState === "unavailable") {
      setState("error")
      setMessage("文件已选择，但当前环境未配置转换引擎，暂不能在线转换。")
      return
    }

    setState("ready")
    setMessage(`${selected.name} 已准备好`)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!file) {
      setState("error")
      setMessage("请先上传 PDF 文件")
      return
    }

    setState("converting")
    setMessage("正在调用本地转换引擎，复杂 PDF 可能需要等待一会儿")
    setDownloadUrl("")
    setDownloadName("")

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/pdf-to-word", {
        method: "POST",
        body: formData,
      })

      const result = (await response.json()) as {
        downloadUrl?: string
        fileName?: string
        error?: string
      }

      if (!response.ok || !result.downloadUrl) {
        throw new Error(result.error ?? "转换失败")
      }

      setDownloadUrl(result.downloadUrl)
      setDownloadName(result.fileName ?? "converted.docx")
      setState("done")
      setMessage("转换完成，可以下载可编辑的 Word 文件")
    } catch (error) {
      setState("error")
      setMessage(error instanceof Error ? error.message : "转换失败")
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
          上传 PDF 后调用本地或自托管转换引擎生成可编辑的 Word 文档。若线上环境未配置转换服务，页面会自动提示不可用。
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
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "PDF"}
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
            {state === "done" ? (
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <FileText className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{engineState === "checking" ? "正在检查转换引擎状态..." : message}</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={!canConvert}>
              {state === "converting" ? "转换中" : "开始转换"}
            </Button>
            {downloadUrl ? (
              <Button asChild variant="outline">
                <a href={downloadUrl}>
                  <Download aria-hidden="true" />
                  下载 Word
                  {downloadName ? <span className="sr-only">：{downloadName}</span> : null}
                </a>
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
