"use client"

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react"
import { AlertCircle, CheckCircle2, Download, FileText, Loader2, UploadCloud } from "lucide-react"
import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  Packer,
  PageBreak,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  VerticalAlignTable,
  WidthType,
} from "docx"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const MAX_FILE_SIZE_MB = 10
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
const MAX_SCAN_PAGES = 10
const RENDER_SCALE = 2.6
const JPEG_QUALITY = 0.96
const PAGE_IMAGE_WIDTH_PX = 780
const PAGE_IMAGE_HEIGHT_PX = 980
const TABLE_IMAGE_WIDTH_PX = 780
const WORD_TABLE_WIDTH_DXA = 10800
const MAX_TABLE_CELLS = 240

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
  supportsScannedPdf?: boolean
  supportsBrowserLayout?: boolean
  maxOcrPages?: number
  maxFileSizeMb?: number
}

type RenderedImage = {
  data: Uint8Array
  width: number
  height: number
  type: "jpg" | "png"
}

type TableRegion = {
  x: number
  y: number
  width: number
  height: number
  xs: number[]
  ys: number[]
}

type PageElement =
  | {
      kind: "image"
      image: RenderedImage
    }
  | {
      kind: "table"
      region: TableRegion
      cells: (RenderedImage | null)[][]
    }

type RenderedPage = {
  pageNumber: number
  elements: PageElement[]
  fallback: RenderedImage
}

type CanvasPixels = {
  data: Uint8ClampedArray
  width: number
  height: number
}

const stateLabel: Record<ConvertState, string> = {
  idle: "请选择 PDF 文件",
  ready: "开始转换",
  checking: "正在检查文件...",
  "extracting-text": "正在提取 PDF 文字...",
  "detecting-ocr": "正在检测扫描件版式...",
  ocr: "正在重建扫描件版式...",
  "generating-word": "正在生成 Word 文件...",
  done: "下载 Word 文件",
  error: "重新选择文件",
}

const tableBorder = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: "9CA3AF",
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

function getCanvasPixels(canvas: HTMLCanvasElement): CanvasPixels | null {
  const context = canvas.getContext("2d", { willReadFrequently: true })
  if (!context) return null

  const image = context.getImageData(0, 0, canvas.width, canvas.height)
  return {
    data: image.data,
    width: canvas.width,
    height: canvas.height,
  }
}

function isInk(data: Uint8ClampedArray, index: number, threshold = 245) {
  return data[index] < threshold || data[index + 1] < threshold || data[index + 2] < threshold
}

function hasInk(canvas: HTMLCanvasElement, threshold = 245, step = 2) {
  const pixels = getCanvasPixels(canvas)
  if (!pixels) return false

  for (let y = 0; y < pixels.height; y += step) {
    for (let x = 0; x < pixels.width; x += step) {
      const index = (y * pixels.width + x) * 4
      if (isInk(pixels.data, index, threshold)) return true
    }
  }

  return false
}

function findContentBounds(canvas: HTMLCanvasElement) {
  const pixels = getCanvasPixels(canvas)
  if (!pixels) return null

  let left = pixels.width
  let top = pixels.height
  let right = -1
  let bottom = -1

  for (let y = 0; y < pixels.height; y += 2) {
    for (let x = 0; x < pixels.width; x += 2) {
      const index = (y * pixels.width + x) * 4

      if (isInk(pixels.data, index, 250)) {
        left = Math.min(left, x)
        top = Math.min(top, y)
        right = Math.max(right, x)
        bottom = Math.max(bottom, y)
      }
    }
  }

  if (right < left || bottom < top) return null

  const padding = Math.round(Math.min(pixels.width, pixels.height) * 0.02)
  return {
    left: Math.max(0, left - padding),
    top: Math.max(0, top - padding),
    right: Math.min(pixels.width - 1, right + padding),
    bottom: Math.min(pixels.height - 1, bottom + padding),
  }
}

function copyCanvasRegion(source: HTMLCanvasElement, x: number, y: number, width: number, height: number) {
  const left = Math.max(0, Math.floor(x))
  const top = Math.max(0, Math.floor(y))
  const right = Math.min(source.width, Math.ceil(x + width))
  const bottom = Math.min(source.height, Math.ceil(y + height))
  const targetWidth = Math.max(1, right - left)
  const targetHeight = Math.max(1, bottom - top)
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d", { alpha: false })

  canvas.width = targetWidth
  canvas.height = targetHeight

  if (!context) return canvas

  context.fillStyle = "#ffffff"
  context.fillRect(0, 0, targetWidth, targetHeight)
  context.drawImage(source, left, top, targetWidth, targetHeight, 0, 0, targetWidth, targetHeight)

  return canvas
}

function cropCanvasWhitespace(source: HTMLCanvasElement) {
  const bounds = findContentBounds(source)
  if (!bounds) return source

  const cropWidth = bounds.right - bounds.left + 1
  const cropHeight = bounds.bottom - bounds.top + 1

  if (cropWidth < source.width * 0.06 || cropHeight < source.height * 0.06) {
    return source
  }

  return copyCanvasRegion(source, bounds.left, bounds.top, cropWidth, cropHeight)
}

function canvasToImage(canvas: HTMLCanvasElement, type: "jpg" | "png" = "png"): RenderedImage {
  const mimeType = type === "jpg" ? "image/jpeg" : "image/png"
  const dataUrl = type === "jpg" ? canvas.toDataURL(mimeType, JPEG_QUALITY) : canvas.toDataURL(mimeType)

  return {
    data: dataUrlToUint8Array(dataUrl),
    width: canvas.width,
    height: canvas.height,
    type,
  }
}

function releaseCanvas(canvas: HTMLCanvasElement) {
  canvas.width = 0
  canvas.height = 0
}

function clusterPositions(positions: number[], tolerance = 6) {
  if (positions.length === 0) return []

  const clusters: number[][] = []
  let current: number[] = [positions[0]]

  for (let index = 1; index < positions.length; index += 1) {
    const value = positions[index]
    const previous = current[current.length - 1]

    if (value - previous <= tolerance) {
      current.push(value)
    } else {
      clusters.push(current)
      current = [value]
    }
  }

  clusters.push(current)

  return clusters.map((cluster) => Math.round(cluster.reduce((sum, value) => sum + value, 0) / cluster.length))
}

function filterGridLines(lines: number[], minGap = 14) {
  if (lines.length <= 1) return lines

  const filtered = [lines[0]]

  for (const line of lines.slice(1)) {
    if (line - filtered[filtered.length - 1] >= minGap) {
      filtered.push(line)
    }
  }

  return filtered
}

function collectVerticalLines(pixels: CanvasPixels, x0: number, x1: number, y0: number, y1: number, ratio: number) {
  const positions: number[] = []
  const left = Math.max(0, Math.floor(x0))
  const right = Math.min(pixels.width - 1, Math.ceil(x1))
  const top = Math.max(0, Math.floor(y0))
  const bottom = Math.min(pixels.height - 1, Math.ceil(y1))
  const step = 2
  const required = Math.max(8, Math.round(((bottom - top + 1) / step) * ratio))

  for (let x = left; x <= right; x += 1) {
    let count = 0

    for (let y = top; y <= bottom; y += step) {
      const index = (y * pixels.width + x) * 4
      if (isInk(pixels.data, index, 238)) count += 1
    }

    if (count >= required) {
      positions.push(x)
    }
  }

  return positions
}

function collectHorizontalLines(pixels: CanvasPixels, x0: number, x1: number, y0: number, y1: number, ratio: number) {
  const positions: number[] = []
  const left = Math.max(0, Math.floor(x0))
  const right = Math.min(pixels.width - 1, Math.ceil(x1))
  const top = Math.max(0, Math.floor(y0))
  const bottom = Math.min(pixels.height - 1, Math.ceil(y1))
  const step = 2
  const required = Math.max(8, Math.round(((right - left + 1) / step) * ratio))

  for (let y = top; y <= bottom; y += 1) {
    let count = 0

    for (let x = left; x <= right; x += step) {
      const index = (y * pixels.width + x) * 4
      if (isInk(pixels.data, index, 238)) count += 1
    }

    if (count >= required) {
      positions.push(y)
    }
  }

  return positions
}

function detectTableRegion(canvas: HTMLCanvasElement): TableRegion | null {
  const pixels = getCanvasPixels(canvas)
  if (!pixels) return null

  const roughVertical = filterGridLines(
    clusterPositions(collectVerticalLines(pixels, 0, pixels.width - 1, 0, pixels.height - 1, 0.08)),
  )

  if (roughVertical.length < 3) return null

  const roughX0 = Math.max(0, roughVertical[0] - 12)
  const roughX1 = Math.min(pixels.width - 1, roughVertical[roughVertical.length - 1] + 12)
  const horizontal = filterGridLines(
    clusterPositions(collectHorizontalLines(pixels, roughX0, roughX1, 0, pixels.height - 1, 0.32)),
  )

  if (horizontal.length < 3) return null

  const roughY0 = Math.max(0, horizontal[0] - 12)
  const roughY1 = Math.min(pixels.height - 1, horizontal[horizontal.length - 1] + 12)
  const vertical = filterGridLines(
    clusterPositions(collectVerticalLines(pixels, roughX0, roughX1, roughY0, roughY1, 0.38)),
  )
  const refinedHorizontal = filterGridLines(
    clusterPositions(collectHorizontalLines(pixels, vertical[0] ?? roughX0, vertical[vertical.length - 1] ?? roughX1, roughY0, roughY1, 0.32)),
  )

  if (vertical.length < 3 || refinedHorizontal.length < 3) return null

  const x = Math.max(0, vertical[0])
  const y = Math.max(0, refinedHorizontal[0])
  const right = Math.min(pixels.width - 1, vertical[vertical.length - 1])
  const bottom = Math.min(pixels.height - 1, refinedHorizontal[refinedHorizontal.length - 1])
  const width = right - x
  const height = bottom - y
  const columnCount = vertical.length - 1
  const rowCount = refinedHorizontal.length - 1

  if (columnCount < 2 || rowCount < 2) return null
  if (columnCount * rowCount > MAX_TABLE_CELLS) return null
  if (width < pixels.width * 0.25 || height < pixels.height * 0.08) return null

  return {
    x,
    y,
    width,
    height,
    xs: vertical,
    ys: refinedHorizontal,
  }
}

function makeImageElementFromRegion(
  source: HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number,
  type: "jpg" | "png" = "jpg",
): PageElement | null {
  if (width < 16 || height < 16) return null

  const region = copyCanvasRegion(source, x, y, width, height)
  const cropped = cropCanvasWhitespace(region)

  try {
    if (!hasInk(cropped)) return null

    return {
      kind: "image",
      image: canvasToImage(cropped, type),
    }
  } finally {
    if (cropped !== region) releaseCanvas(cropped)
    releaseCanvas(region)
  }
}

function makeCellImage(source: HTMLCanvasElement, x: number, y: number, width: number, height: number) {
  const inset = Math.max(2, Math.round(Math.min(width, height) * 0.04))
  const cell = copyCanvasRegion(source, x + inset, y + inset, width - inset * 2, height - inset * 2)
  const cropped = cropCanvasWhitespace(cell)

  try {
    if (!hasInk(cropped, 242)) return null
    return canvasToImage(cropped, "png")
  } finally {
    if (cropped !== cell) releaseCanvas(cropped)
    releaseCanvas(cell)
  }
}

function makeCellImages(source: HTMLCanvasElement, region: TableRegion) {
  const rows: (RenderedImage | null)[][] = []

  for (let rowIndex = 0; rowIndex < region.ys.length - 1; rowIndex += 1) {
    const row: (RenderedImage | null)[] = []
    const y = region.ys[rowIndex]
    const height = region.ys[rowIndex + 1] - y

    for (let columnIndex = 0; columnIndex < region.xs.length - 1; columnIndex += 1) {
      const x = region.xs[columnIndex]
      const width = region.xs[columnIndex + 1] - x
      row.push(makeCellImage(source, x, y, width, height))
    }

    rows.push(row)
  }

  return rows
}

function makePageElements(canvas: HTMLCanvasElement): PageElement[] {
  const table = detectTableRegion(canvas)

  if (!table) {
    return [
      {
        kind: "image",
        image: canvasToImage(canvas, "jpg"),
      },
    ]
  }

  const cells = makeCellImages(canvas, table)
  const hasCellContent = cells.some((row) => row.some(Boolean))

  if (!hasCellContent) {
    return [
      {
        kind: "image",
        image: canvasToImage(canvas, "jpg"),
      },
    ]
  }

  const elements: PageElement[] = []
  const top = makeImageElementFromRegion(canvas, 0, 0, canvas.width, table.y - 8)

  if (top) elements.push(top)

  elements.push({
    kind: "table",
    region: table,
    cells,
  })

  const bottomStart = table.y + table.height + 8
  const bottom = makeImageElementFromRegion(canvas, 0, bottomStart, canvas.width, canvas.height - bottomStart)

  if (bottom) elements.push(bottom)

  return elements
}

function fitImage(width: number, height: number, maxWidth: number, maxHeight: number) {
  const scale = Math.min(maxWidth / width, maxHeight / height, 1)

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

function makeImageParagraph(image: RenderedImage, maxWidth = PAGE_IMAGE_WIDTH_PX, maxHeight = PAGE_IMAGE_HEIGHT_PX) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 80 },
    children: [
      new ImageRun({
        data: image.data,
        transformation: fitImage(image.width, image.height, maxWidth, maxHeight),
        type: image.type,
      }),
    ],
  })
}

function proportionalWidths(sourceWidths: number[], totalWidth: number) {
  const sourceTotal = sourceWidths.reduce((sum, width) => sum + width, 0)
  let usedWidth = 0

  return sourceWidths.map((width, index) => {
    if (index === sourceWidths.length - 1) {
      return Math.max(120, totalWidth - usedWidth)
    }

    const calculated = Math.max(120, Math.round((width / sourceTotal) * totalWidth))
    usedWidth += calculated
    return calculated
  })
}

function makeWordTable(region: TableRegion, cells: (RenderedImage | null)[][]) {
  const sourceColumnWidths = region.xs.slice(0, -1).map((line, index) => region.xs[index + 1] - line)
  const columnWidths = proportionalWidths(sourceColumnWidths, WORD_TABLE_WIDTH_DXA)

  return new Table({
    width: { size: WORD_TABLE_WIDTH_DXA, type: WidthType.DXA },
    columnWidths,
    layout: TableLayoutType.FIXED,
    alignment: AlignmentType.CENTER,
    margins: {
      top: 35,
      bottom: 35,
      left: 35,
      right: 35,
    },
    borders: {
      top: tableBorder,
      bottom: tableBorder,
      left: tableBorder,
      right: tableBorder,
      insideHorizontal: tableBorder,
      insideVertical: tableBorder,
    },
    rows: cells.map(
      (row) =>
        new TableRow({
          cantSplit: true,
          children: row.map((cellImage, columnIndex) => {
            const columnPixelWidth = Math.max(
              24,
              Math.round((columnWidths[columnIndex] / WORD_TABLE_WIDTH_DXA) * TABLE_IMAGE_WIDTH_PX) - 8,
            )
            const children = cellImage
              ? [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 0, after: 0 },
                    children: [
                      new ImageRun({
                        data: cellImage.data,
                        transformation: fitImage(cellImage.width, cellImage.height, columnPixelWidth, 180),
                        type: cellImage.type,
                      }),
                    ],
                  }),
                ]
              : [new Paragraph({ text: "", spacing: { before: 0, after: 0 } })]

            return new TableCell({
              width: { size: columnWidths[columnIndex], type: WidthType.DXA },
              verticalAlign: VerticalAlignTable.CENTER,
              margins: {
                top: 35,
                bottom: 35,
                left: 35,
                right: 35,
              },
              children,
            })
          }),
        }),
    ),
  })
}

async function createScannedWord(pages: RenderedPage[]) {
  const children: (Paragraph | Table)[] = []

  pages.forEach((page, index) => {
    if (index > 0) {
      children.push(new Paragraph({ children: [new PageBreak()] }))
    }

    const pageChildren = page.elements.length > 0 ? page.elements : [{ kind: "image" as const, image: page.fallback }]

    for (const element of pageChildren) {
      if (element.kind === "image") {
        children.push(makeImageParagraph(element.image))
      } else {
        children.push(makeWordTable(element.region, element.cells))
        children.push(new Paragraph({ text: "", spacing: { before: 40, after: 60 } }))
      }
    }
  })

  const document = new Document({
    creator: "qiu.dev PDF to Word",
    title: "PDF scan layout conversion",
    description: "Generated by qiu.dev PDF to Word browser layout converter",
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
  const [message, setMessage] = useState("文本型 PDF 会优先走快速转换；扫描件会自动切换到版式重建模式。")
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
    setMessage("文本型 PDF 会优先走快速转换；扫描件会自动切换到版式重建模式。")
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
    setMessage("已选择 PDF。点击开始后会先尝试快速文字提取，必要时自动重建扫描件版式。")
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
    setMessage("未检测到可编辑文字层，正在切换到扫描件版式重建...")
    setProgress({ label: "正在读取 PDF", percent: 12 })

    const pdfjsUrl = "/pdf.legacy.min.mjs"
    const pdfjs = (await import(/* webpackIgnore: true */ pdfjsUrl)) as typeof import("pdfjs-dist")
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.legacy.min.mjs"

    const bytes = await selectedFile.arrayBuffer()
    const loadingTask = pdfjs.getDocument({ data: bytes })
    const pdf = await loadingTask.promise
    const pageCount = pdf.numPages

    if (pageCount > MAX_SCAN_PAGES) {
      throw new Error("当前免费扫描件版最多支持 10 页 PDF。请拆分 PDF 后再上传，或等待后续高级版。")
    }

    setState("ocr")
    setMessage("正在高清渲染、裁白边并检测表格线...")

    const pages: RenderedPage[] = []

    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      setProgress({
        label: `正在渲染第 ${pageNumber} / ${pageCount} 页`,
        percent: Math.round(15 + ((pageNumber - 1) / pageCount) * 70),
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

      setProgress({
        label: `正在重建第 ${pageNumber} / ${pageCount} 页版式`,
        percent: Math.round(18 + ((pageNumber - 1) / pageCount) * 72),
      })

      const cropped = cropCanvasWhitespace(canvas)
      const fallback = canvasToImage(cropped, "jpg")
      const elements = makePageElements(cropped)

      pages.push({
        pageNumber,
        elements,
        fallback,
      })

      if (cropped !== canvas) releaseCanvas(cropped)
      releaseCanvas(canvas)
    }

    if (pages.length === 0) {
      throw new Error("未能渲染 PDF 页面，可能是加密 PDF 或浏览器无法读取该文件。")
    }

    setState("generating-word")
    setMessage("正在生成 Word 文件...")
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

  const capabilityText = status?.mode
    ? `当前模式：${status.mode}`
    : serviceState === "checking"
      ? "正在读取转换能力"
      : "转换能力读取失败"

  return (
    <Card className="mx-auto max-w-3xl border-border/70 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">免费版</Badge>
          <Badge variant="outline">文本 PDF + 扫描件版式重建</Badge>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl">PDF 转 Word</CardTitle>
          <CardDescription className="text-base">
            文本型 PDF 会走服务端转换；扫描件会在浏览器端高清渲染、裁白边、识别表格线并生成 Word。
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
              免费版：扫描件最多 {status?.maxOcrPages || MAX_SCAN_PAGES} 页，最大{" "}
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
              <li>文本型 PDF 快速转 Word</li>
              <li>扫描件 PDF 版式重建</li>
              <li>图片版 PDF 高清裁剪写入 Word</li>
              <li>表格线检测与 Word 表格生成</li>
              <li>本地浏览器处理扫描件，不上传到第三方 OCR</li>
            </ul>
          </section>

          <section className="rounded-lg border bg-background p-4">
            <h3 className="text-sm font-semibold">免费版限制</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>文件最大 {status?.maxFileSizeMb || MAX_FILE_SIZE_MB}MB</li>
              <li>扫描件最多 {status?.maxOcrPages || MAX_SCAN_PAGES} 页</li>
              <li>在线版优先保证可读和不散版</li>
              <li>复杂中文表格的完整可编辑文字仍以桌面高保真版为准</li>
            </ul>
          </section>
        </div>

        <p className="text-xs text-muted-foreground">
          {capabilityText}。扫描件不会再输出乱码 OCR 附录，会优先保留页面和表格视觉结构。
        </p>
      </CardContent>
    </Card>
  )
}
