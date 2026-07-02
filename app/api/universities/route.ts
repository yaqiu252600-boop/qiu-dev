import { NextResponse } from "next/server"

import {
  findUniversities,
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
  const universities = findUniversities({
    keyword: url.searchParams.get("keyword") ?? undefined,
    province: url.searchParams.get("province") ?? undefined,
    education_level: url.searchParams.get("education_level") ?? undefined,
  })

  return NextResponse.json({
    count: universities.length,
    data: universities,
    message:
      universities.length > 0
        ? "查询成功，结果来自教育部 2026 年全国普通高等学校名单。"
        : "暂无可信院校数据，请确认学校名称或调整搜索条件。",
  })
}
