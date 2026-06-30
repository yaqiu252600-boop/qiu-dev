import { createReadStream } from "fs"
import { stat } from "fs/promises"
import { Readable } from "stream"
import { NextResponse } from "next/server"

import {
  downloadVideoFile,
  getVideoToolStatus,
  inspectVideoUrl,
} from "@/lib/video-tool-engine"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

function videoHeaders(fileName: string, size: number) {
  const encodedName = encodeURIComponent(fileName)
  const extension = fileName.split(".").pop()?.toLowerCase()
  const contentType =
    extension === "webm"
      ? "video/webm"
      : extension === "mov"
        ? "video/quicktime"
        : "video/mp4"

  return {
    "Content-Type": contentType,
    "Content-Length": String(size),
    "Content-Disposition": `attachment; filename="${encodedName}"; filename*=UTF-8''${encodedName}`,
    "Cache-Control": "no-store",
  }
}

function errorResponse(error: unknown, status = 500) {
  return NextResponse.json(
    {
      error: error instanceof Error ? error.message : "视频处理失败",
    },
    { status },
  )
}

export async function GET(request: Request) {
  const url = new URL(request.url)

  if (url.searchParams.get("status") === "1") {
    const status = await getVideoToolStatus()

    return NextResponse.json(status)
  }

  if (url.searchParams.get("action") !== "download") {
    return errorResponse(new Error("无效的视频工具请求。"), 400)
  }

  const videoUrl = url.searchParams.get("url") ?? ""
  const format = url.searchParams.get("format") ?? ""

  try {
    const file = await downloadVideoFile(videoUrl, format)
    const fileStat = await stat(file.filePath)
    const stream = createReadStream(file.filePath)

    return new Response(Readable.toWeb(stream) as ReadableStream, {
      headers: videoHeaders(file.fileName, fileStat.size),
    })
  } catch (error) {
    return errorResponse(error, 400)
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      url?: string
    }

    if (!body.url) {
      return errorResponse(new Error("请输入视频链接。"), 400)
    }

    const result = await inspectVideoUrl(body.url)

    return NextResponse.json(result)
  } catch (error) {
    return errorResponse(error, 500)
  }
}
