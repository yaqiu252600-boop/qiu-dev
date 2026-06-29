"use client"

import { ChangeEvent, FormEvent, useMemo, useState } from "react"
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

export function PdfConverter() {
  const [file, setFile] = useState<File | null>(null)
  const [state, setState] = useState<ConvertState>("idle")
  const [message, setMessage] = useState("请选择一个 PDF 文件")
  const [downloadUrl, setDownloadUrl] = useState("")
  const [downloadName, setDownloadName] = useState("")

  const canConvert = useMemo(
    () => Boolean(file) && state !== "converting",
    [file, state],
  )

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]
    setDownloadUrl("")
    setDownloadName("")

    if (!selected) {
      setFile(null)
      setState("idle")
      setMessage("请选择一个 PDF 文件")
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
          上传 PDF 后调用本地转换引擎生成可编辑的 Word 文档。文件在本机处理，不会上传到第三方服务。
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
            <span>{message}</span>
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
