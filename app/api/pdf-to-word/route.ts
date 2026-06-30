import fs from "fs/promises"
import { NextResponse } from "next/server"

import {
  convertPdfToWord,
  findPdfToWordEngine,
  getConvertedFilePath,
} from "@/lib/pdf-to-word-engine"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function isPdfFile(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
}

function downloadHeaders(fileName: string) {
  const encodedName = encodeURIComponent(fileName)

  return {
    "Content-Type":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "Content-Disposition": `attachment; filename="${encodedName}"; filename*=UTF-8''${encodedName}`,
    "Cache-Control": "no-store",
  }
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "请上传 PDF 文件" }, { status: 400 })
  }

  if (!isPdfFile(file)) {
    return NextResponse.json({ error: "只支持 PDF 文件" }, { status: 400 })
  }

  try {
    const result = await convertPdfToWord(file)
    const downloadUrl = `/api/pdf-to-word?job=${encodeURIComponent(
      result.jobId,
    )}&file=${encodeURIComponent(result.fileName)}`

    return NextResponse.json({
      downloadUrl,
      fileName: result.fileName,
      mode: "real",
      message: "转换完成，已生成可下载的 Word 文件",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "转换失败",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)

  if (url.searchParams.get("status") === "1") {
    const enginePath = await findPdfToWordEngine()

    return NextResponse.json({
      available: Boolean(enginePath),
      mode: "local-engine",
      message: enginePath
        ? "当前环境已配置 PDF 转 Word 转换引擎。"
        : "当前环境未配置 PDF 转 Word 转换引擎。Vercel 线上不能直接运行本地 Windows EXE，需要接入独立转换服务后才能在线转换。",
    })
  }

  const jobId = url.searchParams.get("job")
  const fileName = url.searchParams.get("file")

  if (!jobId || !fileName) {
    return NextResponse.json({ error: "无效的下载链接" }, { status: 400 })
  }

  const outputPath = getConvertedFilePath(jobId, fileName)

  if (!outputPath) {
    return NextResponse.json({ error: "无效的下载链接" }, { status: 400 })
  }

  try {
    const file = await fs.readFile(outputPath)
    return new Response(file, {
      headers: downloadHeaders(fileName),
    })
  } catch {
    return NextResponse.json({ error: "文件不存在或已过期" }, { status: 404 })
  }
}
