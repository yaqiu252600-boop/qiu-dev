import { NextResponse } from "next/server"

import {
  convertPdfToWord,
  getPdfToWordStatus,
} from "@/lib/pdf-to-word-engine"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function isPdfFile(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
}

function downloadHeaders(fileName: string, pageCount: number, textItemCount: number) {
  const encodedName = encodeURIComponent(fileName)

  return {
    "Content-Type":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "Content-Disposition": `attachment; filename="${encodedName}"; filename*=UTF-8''${encodedName}`,
    "Cache-Control": "no-store",
    "X-Conversion-Mode": "server-text",
    "X-Pdf-Page-Count": String(pageCount),
    "X-Pdf-Text-Items": String(textItemCount),
  }
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "请上传 PDF 文件。" }, { status: 400 })
  }

  if (!isPdfFile(file)) {
    return NextResponse.json({ error: "只支持 PDF 文件。" }, { status: 400 })
  }

  try {
    const result = await convertPdfToWord(file)

    return new Response(new Uint8Array(result.buffer), {
      headers: downloadHeaders(result.fileName, result.pageCount, result.textItemCount),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "转换失败，请换一个 PDF 再试。",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)

  if (url.searchParams.get("status") === "1") {
    return NextResponse.json(getPdfToWordStatus())
  }

  return NextResponse.json({ error: "无效的请求。" }, { status: 400 })
}
