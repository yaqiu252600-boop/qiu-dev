"use client"

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react"
import { AlertCircle, CheckCircle2, Download, FileText, Loader2, UploadCloud } from "lucide-react"
import { Document, HeadingLevel, Packer, PageBreak, Paragraph, TextRun } from "docx"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const MAX_FILE_SIZE_MB = 10
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
const MAX_OCR_PAGES = 10
const OCR_LANGUAGES = "eng+chi_sim"

type ConvertState =
  | "idle"
  | "ready"
  | "checking"
  | "extracting-text"
  | "detecting-ocr"
  | "ocr"
  | "generating-word"
  | "done"
  | "error"

type ServiceState = "checking" | "available" | "unavailable"

type ProgressInfo = {
  label: string
  percent: number
}

type StatusPayload = {
  available?: boolean
  mode?: string
  supportsTextPdf?: boolean
  supportsOcr?: boolean
  ocrMode?: string
  ocrLanguages?: string[]
  maxOcrPages?: number
  maxFileSizeMb?: number
  message?: string
}

type OcrPageResult = {
  pageNumber: number
  text: string
  failed?: boolean
}

const stateLabel: Record<ConvertState, string> = {
  idle: "请选择 PDF 文件",
  ready: "开始转换",
  checking: "正在检查文件...",
  "extracting-text": "正在提取 PDF 文字...",
  "detecting-ocr": "正在检测是否需要 OCR...",
  ocr: "正在 OCR 识别扫描件文字...",
  "generating-word": "正在生成 Word 文件...",
  done: "下载 Word 文件",
  error: "重新选择文件",
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function getDocxName(pdfName: string, suffix = "") {
  const baseName = pdfName.replace(/\.pdf$/i, "").trim() || "converted"
  return `${baseName}${suffix}.docx`
}

function fileNameFromDisposition(disposition: string | null, fallback: string) {
  if (!disposition) return fallback

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].replace(/"/g, ""))
    } catch {
      return utf8Match[1].replace(/"/g, "")
    }
  }

  const plainMatch = disposition.match(/filename="?([^";]+)"?/i)
  if (plainMatch?.[1]) {
    try {
      return decodeURIComponent(plainMatch[1])
    } catch {
      return plainMatch[1]
    }
  }

  return fallback
}

function validateSelectedFile(file: File | null) {
  if (!file) return "请先选择 PDF 文件。"
  if (file.size <= 0) return "文件为空，请重新选择 PDF。"

  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  if (!isPdf) return "只支持 PDF 文件，请重新选择。"

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `当前免费版最大支持 ${MAX_FILE_SIZE_MB}MB PDF，请压缩或拆分后再上传。`
  }

  return ""
}

function isNoTextError(message: string) {
  const text = message.toLowerCase()
  return (
    text.includes("没有从 pdf") ||
    text.includes("没有提取") ||
    text.includes("未提取") ||
    text.includes("no text") ||
    text.includes("empty text") ||
    text.includes("scanned") ||
    text.includes("扫描件") ||
    text.includes("图片型") ||
    text.includes("图片版") ||
    text.includes("文字层")
  )
}

function splitTextIntoParagraphs(text: string) {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim()
  if (!normalized) return ["本页未识别到文字。"]

  return normalized
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
}

function buildTextParagraph(block: string) {
  const lines = block.split("\n")

  return new Paragraph({
    spacing: { after: 160 },
    children: lines.flatMap((line, index) => {
      const run = new TextRun({ text: line })
      return index === 0 ? [run] : [new TextRun({ break: 1 }), run]
    }),
  })
}

async function createOcrWord(fileName: string, pages: OcrPageResult[]) {
  const children: Paragraph[] = [
    new Paragraph({
      text: "PDF OCR 转 Word 结果",
      heading: HeadingLevel.TITLE,
      spacing: { after: 240 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `文件名：${fileName}` })],
      spacing: { after: 320 },
    }),
  ]

  pages.forEach((page, index) => {
    if (index > 0) {
      children.push(new Paragraph({ children: [new PageBreak()] }))
    }

    children.push(
      new Paragraph({
        text: `第 ${page.pageNumber} 页`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 160, after: 160 },
      }),
    )

    if (page.failed) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: "本页识别失败。", italics: true })],
          spacing: { after: 160 },
        }),
      )
      return
    }

    splitTextIntoParagraphs(page.text).forEach((block) => {
      children.push(buildTextParagraph(block))
    })
  })

  const document = new Document({
    sections: [{ properties: {}, children }],
  })

  return Packer.toBlob(document)
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  return url
}

export function PdfConverter() {
  const [serviceState, setServiceState] = useState<ServiceState>("checking")
  const [status, setStatus] = useState<StatusPayload | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [state, setState] = useState<ConvertState>("idle")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("文本型 PDF 会优先走快速转换；扫描件会自动切换到浏览器 OCR。")
  const [progress, setProgress] = useState<ProgressInfo>({ label: "等待上传", percent: 0 })
  const [downloadUrl, setDownloadUrl] = useState("")
  const [downloadName, setDownloadName] = useState("")

  const isWorking = ["checking", "extracting-text", "detecting-ocr", "ocr", "generating-word"].includes(state)
  const buttonDisabled = !file || isWorking || serviceState === "unavailable"

  const fileError = useMemo(() => validateSelectedFile(file), [file])

  useEffect(() => {
    let ignore = false

    fetch("/api/pdf-to-word/status", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: StatusPayload) => {
        if (ignore) return
        setStatus(payload)
        setServiceState(payload.available ? "available" : "unavailable")
      })
      .catch(() => {
        if (ignore) return
        setServiceState("unavailable")
        setError("转换服务暂时不可用，请稍后再试。")
      })

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    }
  }, [downloadUrl])

  function resetResult() {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    setDownloadUrl("")
    setDownloadName("")
    setError("")
    setProgress({ label: "等待上传", percent: 0 })
    setMessage("文本型 PDF 会优先走快速转换；扫描件会自动切换到浏览器 OCR。")
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null
    resetResult()
    setFile(selectedFile)

    if (!selectedFile) {
      setState("idle")
      return
    }

    const validationError = validateSelectedFile(selectedFile)
    if (validationError) {
      setState("error")
      setError(validationError)
      return
    }

    setState("ready")
    setMessage("已选择 PDF。点击开始后会先尝试快速文字提取，必要时自动 OCR。")
  }

  async function runServerTextConversion(selectedFile: File) {
    const formData = new FormData()
    formData.append("file", selectedFile)

    const response = await fetch("/api/pdf-to-word", {
      method: "POST",
      body: formData,
    })

    if (response.ok) {
      const blob = await response.blob()
      const fallbackName = getDocxName(selectedFile.name)
      const outputName = fileNameFromDisposition(response.headers.get("Content-Disposition"), fallbackName)
      const url = downloadBlob(blob, outputName)
      setDownloadUrl(url)
      setDownloadName(outputName)
      return
    }

    let serverMessage = "转换失败，请换一个 PDF 再试。"
    try {
      const payload = (await response.json()) as { error?: string }
      serverMessage = payload.error || serverMessage
    } catch {
      serverMessage = response.statusText || serverMessage
    }

    throw new Error(serverMessage)
  }

  async function runBrowserOcr(selectedFile: File) {
    setState("detecting-ocr")
    setMessage("未检测到可编辑文字层，正在检测是否需要 OCR...")
    setProgress({ label: "正在读取 PDF", percent: 12 })

    const pdfjs = await import("pdfjs-dist")
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"

    const bytes = await selectedFile.arrayBuffer()
    const loadingTask = pdfjs.getDocument({ data: bytes })
    const pdf = await loadingTask.promise
    const pageCount = pdf.numPages

    if (pageCount > MAX_OCR_PAGES) {
      throw new Error("当前免费 OCR 版最多支持 10 页 PDF。请拆分 PDF 后再上传，或等待后续高级版。")
    }

    setState("ocr")
    setMessage("正在 OCR 识别扫描件文字...")

    const { createWorker } = await import("tesseract.js")
    let currentPage = 1
    const worker = await createWorker(OCR_LANGUAGES, 1, {
      logger: (info: { status?: string; progress?: number }) => {
        if (info.status === "recognizing text" && typeof info.progress === "number") {
          const pageBase = 20 + ((currentPage - 1) / pageCount) * 65
          const pageShare = (info.progress / pageCount) * 65
          setProgress({
            label: `正在识别第 ${currentPage} / ${pageCount} 页`,
            percent: Math.min(88, Math.round(pageBase + pageShare)),
          })
        }
      },
    })

    const pages: OcrPageResult[] = []

    try {
      for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
        currentPage = pageNumber
        setProgress({
          label: `正在渲染第 ${pageNumber} / ${pageCount} 页`,
          percent: Math.round(15 + ((pageNumber - 1) / pageCount) * 65),
        })

        const page = await pdf.getPage(pageNumber)
        const viewport = page.getViewport({ scale: 1.6 })
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d", { alpha: false })

        if (!context) {
          pages.push({ pageNumber, text: "本页识别失败。", failed: true })
          continue
        }

        canvas.width = Math.ceil(viewport.width)
        canvas.height = Math.ceil(viewport.height)
        context.fillStyle = "#ffffff"
        context.fillRect(0, 0, canvas.width, canvas.height)

        await page.render({ canvas, canvasContext: context, viewport }).promise

        setProgress({
          label: `正在识别第 ${pageNumber} / ${pageCount} 页`,
          percent: Math.round(20 + ((pageNumber - 1) / pageCount) * 65),
        })

        try {
          const result = await worker.recognize(canvas)
          pages.push({ pageNumber, text: result.data.text.trim() })
        } catch {
          pages.push({ pageNumber, text: "本页识别失败。", failed: true })
        } finally {
          canvas.width = 0
          canvas.height = 0
        }
      }
    } finally {
      await worker.terminate()
    }

    const hasRecognizedText = pages.some((page) => !page.failed && page.text.trim().length > 0)
    if (!hasRecognizedText) {
      throw new Error("OCR 未识别到文字，可能是图片太模糊、文字太小、页面倾斜、加密 PDF 或手写内容导致。")
    }

    setState("generating-word")
    setMessage("OCR 完成，正在生成 Word 文件...")
    setProgress({ label: "正在生成 Word", percent: 92 })

    const blob = await createOcrWord(selectedFile.name, pages)
    const outputName = getDocxName(selectedFile.name, "-ocr")
    const url = downloadBlob(blob, outputName)
    setDownloadUrl(url)
    setDownloadName(outputName)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isWorking) return

    const validationError = validateSelectedFile(file)
    if (validationError || !file) {
      setState("error")
      setError(validationError || "请先选择 PDF 文件。")
      return
    }

    resetResult()
    setState("checking")
    setMessage("正在检查文件...")
    setProgress({ label: "正在检查文件", percent: 4 })

    try {
      setState("extracting-text")
      setMessage("正在提取 PDF 文字...")
      setProgress({ label: "正在提取 PDF 文字", percent: 10 })

      await runServerTextConversion(file)

      setState("done")
      setMessage("转换完成，Word 文件已生成。")
      setProgress({ label: "已完成", percent: 100 })
    } catch (serverError) {
      const serverMessage = serverError instanceof Error ? serverError.message : "转换失败，请换一个 PDF 再试。"

      if (!isNoTextError(serverMessage)) {
        setState("error")
        setError(serverMessage)
        setProgress({ label: "转换失败", percent: 0 })
        return
      }

      try {
        await runBrowserOcr(file)
        setState("done")
        setMessage("OCR 转换完成，Word 文件已生成。")
        setProgress({ label: "已完成", percent: 100 })
      } catch (ocrError) {
        setState("error")
        setError(ocrError instanceof Error ? ocrError.message : "OCR 转换失败，请换一个 PDF 再试。")
        setProgress({ label: "转换失败", percent: 0 })
      }
    }
  }

  const capabilityText = status?.supportsOcr
    ? `当前模式：${status.mode || "server-text-plus-browser-ocr"}`
    : "正在读取转换能力"

  return (
    <Card className="mx-auto max-w-3xl border-border/70 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">免费版</Badge>
          <Badge variant="outline">文本 PDF + 扫描件 OCR</Badge>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl">PDF 转 Word</CardTitle>
          <CardDescription className="text-base">
            文本型 PDF 会走服务端转换；扫描件 OCR 在浏览器端识别，速度取决于你的设备性能。
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <label
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center transition hover:bg-muted/50",
              isWorking && "pointer-events-none opacity-70",
            )}
          >
            <input
              className="sr-only"
              type="file"
              accept="application/pdf,.pdf"
              disabled={isWorking}
              onChange={handleFileChange}
            />
            <UploadCloud className="mb-3 h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <span className="text-base font-medium">选择 PDF 文件</span>
            <span className="mt-1 text-sm text-muted-foreground">
              免费版：OCR 最多 {status?.maxOcrPages || MAX_OCR_PAGES} 页，最大{" "}
              {status?.maxFileSizeMb || MAX_FILE_SIZE_MB}MB
            </span>
          </label>

          {file ? (
            <div className="flex min-w-0 items-start gap-3 rounded-lg border bg-background p-4">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 break-words text-muted-foreground">{progress.label}</span>
              <span className="shrink-0 font-medium">{Math.round(progress.percent)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progress.percent))}%` }}
              />
            </div>
          </div>

          {error || fileError ? (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="break-words">{error || fileError}</span>
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
              {state === "done" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden="true" />
              ) : (
                <FileText className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              <span className="break-words">{message}</span>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" className="w-full sm:flex-1" disabled={buttonDisabled}>
              {isWorking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {stateLabel[state]}
            </Button>
            {downloadUrl ? (
              <Button asChild variant="outline" className="w-full sm:flex-1">
                <a href={downloadUrl} download={downloadName || "converted.docx"}>
                  <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                  下载 Word 文件
                </a>
              </Button>
            ) : null}
          </div>
        </form>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-lg border bg-background p-4">
            <h3 className="text-sm font-semibold">当前免费版支持</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>文本型 PDF 转 Word</li>
              <li>扫描件 PDF OCR 转 Word</li>
              <li>图片版 PDF OCR 转 Word</li>
              <li>中文和英文识别</li>
              <li>在线生成 .docx</li>
            </ul>
          </section>

          <section className="rounded-lg border bg-background p-4">
            <h3 className="text-sm font-semibold">免费版限制</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>文件最大 {status?.maxFileSizeMb || MAX_FILE_SIZE_MB}MB</li>
              <li>OCR 最多 {status?.maxOcrPages || MAX_OCR_PAGES} 页</li>
              <li>OCR 速度比普通 PDF 慢</li>
              <li>模糊、歪斜、手写、复杂表格可能影响识别效果</li>
              <li>当前版本主要保证文字可编辑，不承诺 100% 还原原 PDF 排版</li>
            </ul>
          </section>
        </div>

        <p className="text-xs text-muted-foreground">{capabilityText}</p>
      </CardContent>
    </Card>
  )
}
