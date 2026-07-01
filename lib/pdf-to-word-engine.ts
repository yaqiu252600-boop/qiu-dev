import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs"
import { pathToFileURL } from "url"

type TextItem = {
  str: string
  hasEOL?: boolean
}

export type ConversionResult = {
  fileName: string
  buffer: Buffer
  pageCount: number
  textItemCount: number
}

const MAX_FILE_SIZE = 15 * 1024 * 1024
const runtimeRequire = eval("require") as NodeRequire

pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(
  runtimeRequire.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs"),
).toString()

export function getPdfToWordStatus() {
  return {
    available: true,
    mode: "server-text",
    message: "在线转换服务已可用。当前支持文本型 PDF 转为可编辑 Word；扫描件暂不做 OCR。",
  }
}

export function validatePdfFile(file: File) {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("PDF 文件太大，请上传 15MB 以内的文件。")
  }
}

export function makeDocxFileName(name: string) {
  const baseName =
    name
      .replace(/\.pdf$/i, "")
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "converted"

  return `${baseName}.docx`
}

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim()
}

async function extractTextByPage(file: File) {
  const data = new Uint8Array(await file.arrayBuffer())
  const loadingTask = pdfjsLib.getDocument({
    data,
    disableFontFace: true,
    isEvalSupported: false,
    useWorkerFetch: false,
  })
  const pdf = await loadingTask.promise
  const pages: string[][] = []
  let textItemCount = 0

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    const paragraphs: string[] = []
    let line = ""

    for (const item of content.items as TextItem[]) {
      const text = normalizeText(item.str)

      if (text) {
        line = line ? `${line} ${text}` : text
        textItemCount += 1
      }

      if (item.hasEOL && line) {
        paragraphs.push(line)
        line = ""
      }
    }

    if (line) {
      paragraphs.push(line)
    }

    pages.push(paragraphs.length ? paragraphs : [""])
  }

  return {
    pageCount: pdf.numPages,
    pages,
    textItemCount,
  }
}

function buildParagraphs(pages: string[][]) {
  return pages.flatMap((paragraphs, index) => {
    const section = [
      new Paragraph({
        text: `第 ${index + 1} 页`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: index === 0 ? 0 : 320, after: 160 },
      }),
    ]

    for (const paragraph of paragraphs) {
      section.push(
        new Paragraph({
          children: [
            new TextRun({
              text: paragraph || " ",
              size: 22,
            }),
          ],
          spacing: { after: 120 },
        }),
      )
    }

    return section
  })
}

export async function convertPdfToWord(file: File): Promise<ConversionResult> {
  validatePdfFile(file)

  const extracted = await extractTextByPage(file)

  if (extracted.textItemCount === 0) {
    throw new Error(
      "没有从 PDF 中提取到可编辑文本。这个文件可能是扫描件图片版，当前线上版暂不支持 OCR。",
    )
  }

  const document = new Document({
    creator: "qiu.dev PDF 转 Word",
    title: `${file.name} 可编辑版`,
    description: "由 qiu.dev 在线 PDF 转 Word 工具生成",
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: file.name.replace(/\.pdf$/i, ""),
            heading: HeadingLevel.TITLE,
            spacing: { after: 240 },
          }),
          ...buildParagraphs(extracted.pages),
        ],
      },
    ],
  })

  return {
    fileName: makeDocxFileName(file.name),
    buffer: await Packer.toBuffer(document),
    pageCount: extracted.pageCount,
    textItemCount: extracted.textItemCount,
  }
}
