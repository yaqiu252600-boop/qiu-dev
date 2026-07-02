import { NextResponse } from "next/server"

import {
  findScoreSegments,
  getTrustedDataServiceStatus,
} from "@/lib/trusted-gaokao"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export function GET(request: Request) {
  const serviceStatus = getTrustedDataServiceStatus()
  if (!serviceStatus.ok) {
    return NextResponse.json(
      {
        error: serviceStatus.message,
        message: serviceStatus.message,
        count: 0,
        data: [],
      },
      { status: 503 },
    )
  }

  const url = new URL(request.url)
  const year = url.searchParams.get("year")
  const data = findScoreSegments({
    province: url.searchParams.get("province") ?? undefined,
    year: year ? Number(year) : undefined,
    subject_type: url.searchParams.get("subject_type") ?? undefined,
  })

  return NextResponse.json({
    count: data.length,
    data,
    message:
      data.length > 0
        ? "查询成功。"
        : "暂无 verified 逐分段数据。江苏 2026 官方图片已保存，OCR 数据待人工校验，暂不参与位次换算。",
  })
}
