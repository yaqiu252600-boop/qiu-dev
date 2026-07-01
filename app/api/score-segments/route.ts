import { NextResponse } from "next/server"

import { findScoreSegments } from "@/lib/trusted-gaokao"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export function GET(request: Request) {
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
        : "暂无可信一分一段/逐分段数据。江苏 2026 官方数据已保存原图，尚未通过 OCR 校验，暂不参与换算。",
  })
}
