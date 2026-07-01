import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx"
import { inflateSync } from "zlib"

type PdfTextToken = {
  value: string
  newLine: boolean
}

export type ConversionResult = {
  fileName: string
  buffer: Buffer
  pageCount: number
  textItemCount: number
}

const MAX_FILE_SIZE = 15 * 1024 * 1024

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

function decodePdfLiteral(value: string) {
  let result = ""

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]

    if (char !== "\\") {
      result += char
      continue
    }

    const next = value[index + 1]

    if (!next) {
      break
    }

    if (next === "n") {
      result += "\n"
      index += 1
      continue
    }

    if (next === "r") {
      result += "\r"
      index += 1
      continue
    }

    if (next === "t") {
      result += "\t"
      index += 1
      continue
    }

    if (next === "b" || next === "f") {
      index += 1
      continue
    }

    if (next === "(" || next === ")" || next === "\\") {
      result += next
      index += 1
      continue
    }

    const octal = value.slice(index + 1, index + 4).match(/^[0-7]{1,3}/)?.[0]

    if (octal) {
      result += String.fromCharCode(Number.parseInt(octal, 8))
      index += octal.length
      continue
    }

    result += next
    index += 1
  }

  return result
}

function decodePdfHex(value: string) {
  const clean = value.replace(/\s+/g, "")
  const even = clean.length % 2 === 0 ? clean : `${clean}0`
  const bytes: number[] = []

  for (let index = 0; index < even.length; index += 2) {
    bytes.push(Number.parseInt(even.slice(index, index + 2), 16))
  }

  const buffer = Buffer.from(bytes)

  if (buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
    let text = ""

    for (let index = 2; index + 1 < buffer.length; index += 2) {
      text += String.fromCharCode(buffer.readUInt16BE(index))
    }

    return text
  }

  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    return buffer.subarray(2).toString("utf16le")
  }

  return buffer.toString("latin1")
}

function isEscaped(input: string, index: number) {
  let slashCount = 0

  for (let cursor = index - 1; cursor >= 0 && input[cursor] === "\\"; cursor -= 1) {
    slashCount += 1
  }

  return slashCount % 2 === 1
}

function extractLiteralBefore(input: string, endIndex: number) {
  let cursor = endIndex - 1

  while (cursor >= 0 && /\s/.test(input[cursor])) {
    cursor -= 1
  }

  if (input[cursor] === ")") {
    let depth = 1

    for (let index = cursor - 1; index >= 0; index -= 1) {
      if (input[index] === ")" && !isEscaped(input, index)) {
        depth += 1
      }

      if (input[index] === "(" && !isEscaped(input, index)) {
        depth -= 1

        if (depth === 0) {
          return decodePdfLiteral(input.slice(index + 1, cursor))
        }
      }
    }
  }

  if (input[cursor] === ">") {
    const start = input.lastIndexOf("<", cursor - 1)

    if (start >= 0 && input[start - 1] !== "<") {
      return decodePdfHex(input.slice(start + 1, cursor))
    }
  }

  return ""
}

function extractArrayText(arrayBody: string) {
  const pieces: string[] = []

  for (let index = 0; index < arrayBody.length; index += 1) {
    if (arrayBody[index] === "(") {
      let cursor = index + 1

      while (cursor < arrayBody.length) {
        if (arrayBody[cursor] === ")" && !isEscaped(arrayBody, cursor)) {
          pieces.push(decodePdfLiteral(arrayBody.slice(index + 1, cursor)))
          index = cursor
          break
        }

        cursor += 1
      }
    } else if (arrayBody[index] === "<" && arrayBody[index + 1] !== "<") {
      const end = arrayBody.indexOf(">", index + 1)

      if (end > index) {
        pieces.push(decodePdfHex(arrayBody.slice(index + 1, end)))
        index = end
      }
    }
  }

  return pieces.join("")
}

function extractArrayBefore(input: string, endIndex: number) {
  const end = input.lastIndexOf("]", endIndex)
  const start = input.lastIndexOf("[", end)

  if (start < 0 || end < 0 || start > end) {
    return ""
  }

  return extractArrayText(input.slice(start + 1, end))
}

function extractTokensFromStream(stream: string) {
  const tokens: PdfTextToken[] = []
  const operatorPattern = /\b(Tj|TJ|'|")\b/g
  let match: RegExpExecArray | null

  while ((match = operatorPattern.exec(stream))) {
    const operator = match[1]
    const value =
      operator === "TJ"
        ? extractArrayBefore(stream, match.index)
        : extractLiteralBefore(stream, match.index)
    const text = normalizeText(value)

    if (text) {
      tokens.push({
        value: text,
        newLine: operator === "'" || operator === '"',
      })
    }
  }

  return tokens
}

function decodeStream(dictionary: string, body: Buffer) {
  if (!dictionary.includes("/FlateDecode")) {
    return body.toString("latin1")
  }

  try {
    return inflateSync(body).toString("latin1")
  } catch {
    return ""
  }
}

function extractStreams(buffer: Buffer) {
  const source = buffer.toString("latin1")
  const streams: string[] = []
  let cursor = 0

  while (cursor < source.length) {
    const streamStart = source.indexOf("stream", cursor)

    if (streamStart < 0) {
      break
    }

    const bodyStart =
      source[streamStart + 6] === "\r" && source[streamStart + 7] === "\n"
        ? streamStart + 8
        : source[streamStart + 6] === "\n" || source[streamStart + 6] === "\r"
          ? streamStart + 7
          : streamStart + 6
    const streamEnd = source.indexOf("endstream", bodyStart)

    if (streamEnd < 0) {
      break
    }

    const dictStart = source.lastIndexOf("<<", streamStart)
    const dictEnd = source.lastIndexOf(">>", streamStart)
    const dictionary =
      dictStart >= 0 && dictEnd >= dictStart ? source.slice(dictStart, dictEnd + 2) : ""
    const body = buffer.subarray(bodyStart, streamEnd)
    const decoded = decodeStream(dictionary, body)

    if (decoded) {
      streams.push(decoded)
    }

    cursor = streamEnd + 9
  }

  return streams
}

function extractPdfText(buffer: Buffer) {
  const source = buffer.toString("latin1")
  const pageCount = Math.max(source.match(/\/Type\s*\/Page\b/g)?.length ?? 0, 1)
  const tokens = extractStreams(buffer).flatMap(extractTokensFromStream)
  const paragraphs: string[] = []
  let line = ""

  for (const token of tokens) {
    if (token.newLine && line) {
      paragraphs.push(line)
      line = ""
    }

    line = line ? `${line} ${token.value}` : token.value
  }

  if (line) {
    paragraphs.push(line)
  }

  return {
    pageCount,
    paragraphs,
    textItemCount: tokens.length,
  }
}

function buildParagraphs(paragraphs: string[]) {
  return paragraphs.map(
    (paragraph) =>
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

export async function convertPdfToWord(file: File): Promise<ConversionResult> {
  validatePdfFile(file)

  const buffer = Buffer.from(await file.arrayBuffer())
  const extracted = extractPdfText(buffer)

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
          new Paragraph({
            text: `共识别 ${extracted.pageCount} 页`,
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 160 },
          }),
          ...buildParagraphs(extracted.paragraphs),
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
