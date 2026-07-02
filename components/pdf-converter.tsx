"use client"

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react"
import { AlertCircle, CheckCircle2, Download, FileText, Loader2, UploadCloud } from "lucide-react"
import {
  Document,
  ImageRun,
  Packer,
  PageBreak,
  Paragraph,
} from "docx"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const MAX_FILE_SIZE_MB = 10
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
const MAX_OCR_PAGES = 10
const RENDER_SCALE = 2.4
const IMAGE_QUALITY = 0.96

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
  supportsOcr?: boolean
  maxOcrPages?: number
  maxFileSizeMb?: number
}

type RenderedPage = {
  pageNumber: number
  image: Uint8Array
  width: number
  height: number
}

const stateLabel: Record<ConvertState, string> = {
  idle: "请选择 PDF 文件",
  ready: "开始转换",
  checking: "正在检查文件...",
  "extracting-text": "正在提取 PDF 文字...",
  "detecting-ocr": "正在检测扫描件...",
  ocr: "正在优化扫描件版式...",
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

function dataUrlToUint8Array(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] || ""
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

function cropCanvasWhitespace(source: HTMLCanvasElement) {
  const context = source.getContext("2d", { willReadFrequently: true })
  if (!context) return source

  const { width, height } = source
  const image = context.getImageData(0, 0, width, height)
  const data = image.data
  let left = width
  let top = height
  let right = -1
  let bottom = -1

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const index = (y * width + x) * 4
      const r = data[index]
      const g = data[index + 1]
      const b = data[index + 2]

      if (r < 250 || g < 250 || b < 250) {
        left = Math.min(left, x)
        top = Math.min(top, y)
        right = Math.max(right, x)
        bottom = Math.max(bottom, y)
      }
    }
  }

  if (right < left || bottom < top) {
    return source
  }

  const padding = Math.round(Math.min(width, height) * 0.025)
  left = Math.max(0, left - padding)
  top = Math.max(0, top - padding)
  right = Math.min(width - 1, right + padding)
  bottom = Math.min(height - 1, bottom + padding)

  const cropWidth = right - left + 1
  const cropHeight = bottom - top + 1
  if (cropWidth < width * 0.08 || cropHeight < height * 0.08) {
    return source
  }

  const cropped = document.createElement("canvas")
  cropped.width = cropWidth
  cropped.height = cropHeight
  const croppedContext = cropped.getContext("2d", { alpha: false })
  if (!croppedContext) return source

  croppedContext.fillStyle = "#ffffff"
  croppedContext.fillRect(0, 0, cropWidth, cropHeight)
  croppedContext.drawImage(source, left, top, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight)
  return cropped
}

function getFittedImageSize(width: number, height: number) {
  const landscape = width > height
  const maxWidth = landscape ? 980 : 720
  const maxHeight = landscape ? 680 : 960
  const scale = Math.min(maxWidth / width, maxHeight / height)

  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  }
}

async function createScannedWord(pages: RenderedPage[]) {
  const children: Paragraph[] = []

  pages.forEach((page, index) => {
    if (index > 0) {
      children.push(new Paragraph({ children: [new PageBreak()] }))
    }

    const fitted = getFittedImageSize(page.width, page.height)
    children.push(
      new Paragraph({
        spacing: { before: 0, after: 0 },
        children: [
          new ImageRun({
            data: page.image,
            transformation: fitted,
            type: "jpg",
          }),
        ],
      }),
    )
  })

  const document = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 360,
              right: 360,
              bottom: 360,
              left: 360,
            },
          },
        },
        children,
      },
    ],
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
  const [message, setMessage] = useState("文本型 PDF 会优先走快速转换；扫描件会自动切换到版式保留模式。")
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
    setMessage("文本型 PDF 会优先走快速转换；扫描件会自动切换到版式保留模式。")
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
    setMessage("已选择 PDF。点击开始后会先尝试快速文字提取，必要时自动保留扫描件版式。")
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

  async function runScannedPdfConversion(selectedFile: File) {
    setState("detecting-ocr")
    setMessage("未检测到可编辑文字层，正在切换到扫描件版式保留模式...")
    setProgress({ label: "正在读取 PDF", percent: 12 })

    const pdfjs = await import("pdfjs-dist")
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"

    const bytes = await selectedFile.arrayBuffer()
    const loadingTask = pdfjs.getDocument({ data: bytes })
    const pdf = await loadingTask.promise
    const pageCount = pdf.numPages

    if (pageCount > MAX_OCR_PAGES) {
      throw new Error("当前免费扫描件版最多支持 10 页 PDF。请拆分 PDF 后再上传，或等待后续高级版。")
    }

    setState("ocr")
    setMessage("正在渲染并裁剪页面白边...")

    const pages: RenderedPage[] = []

    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      setProgress({
        label: `正在处理第 ${pageNumber} / ${pageCount} 页`,
        percent: Math.round(15 + ((pageNumber - 1) / pageCount) * 75),
      })

      const page = await pdf.getPage(pageNumber)
      const viewport = page.getViewport({ scale: RENDER_SCALE })
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d", { alpha: false })

      if (!context) continue

      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)
      context.fillStyle = "#ffffff"
      context.fillRect(0, 0, canvas.width, canvas.height)

      await page.render({ canvas, canvasContext: context, viewport }).promise

      const cropped = cropCanvasWhitespace(canvas)
      const image = dataUrlToUint8Array(cropped.toDataURL("image/jpeg", IMAGE_QUALITY))
      pages.push({
        pageNumber,
        image,
        width: cropped.width,
        height: cropped.height,
      })

      canvas.width = 0
      canvas.height = 0
      if (cropped !== canvas) {
        cropped.width = 0
        cropped.height = 0
      }
    }

    if (pages.length === 0) {
      throw new Error("未能渲染 PDF 页面，可能是加密 PDF 或浏览器无法读取该文件。")
    }

    setState("generating-word")
    setMessage("正在生成可查看的 Word 文件...")
    setProgress({ label: "正在生成 Word", percent: 94 })

    const blob = await createScannedWord(pages)
    const outputName = getDocxName(selectedFile.name, "-scan-layout")
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
        await runScannedPdfConversion(file)
        setState("done")
        setMessage("扫描件转换完成，Word 文件已生成。")
        setProgress({ label: "已完成", percent: 100 })
      } catch (scanError) {
        setState("error")
        setError(scanError instanceof Error ? scanError.message : "扫描件转换失败，请换一个 PDF 再试。")
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
          <Badge variant="outline">文本 PDF + 扫描件版式保留</Badge>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl">PDF 转 Word</CardTitle>
          <CardDescription className="text-base">
            文本型 PDF 会走服务端转换；扫描件会在浏览器端渲染、裁掉白边并放大写入 Word，优先保证可查看。
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
              免费版：扫描件最多 {status?.maxOcrPages || MAX_OCR_PAGES} 页，最大{" "}
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
              <li>扫描件 PDF 转 Word</li>
              <li>图片版 PDF 转 Word</li>
              <li>自动裁掉页面白边</li>
              <li>扫描件优先保证版式可查看</li>
            </ul>
          </section>

          <section className="rounded-lg border bg-background p-4">
            <h3 className="text-sm font-semibold">免费版限制</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>文件最大 {status?.maxFileSizeMb || MAX_FILE_SIZE_MB}MB</li>
              <li>扫描件最多 {status?.maxOcrPages || MAX_OCR_PAGES} 页</li>
              <li>扫描件输出为页面图片，主要解决能看和不散版</li>
              <li>需要真正可编辑表格时，仍需要桌面版那类后端引擎</li>
            </ul>
          </section>
        </div>

        <p className="text-xs text-muted-foreground">{capabilityText}</p>
      </CardContent>
    </Card>
  )
}
