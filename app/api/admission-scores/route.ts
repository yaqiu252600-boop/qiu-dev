import { NextResponse } from "next/server"

import {
  findAdmissionScores,
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
  const data = findAdmissionScores({
    province: url.searchParams.get("province") ?? undefined,
    year: year ? Number(year) : undefined,
    subject_type: url.searchParams.get("subject_type") ?? undefined,
    batch_name: url.searchParams.get("batch_name") ?? undefined,
    keyword: url.searchParams.get("keyword") ?? undefined,
    university_code: url.searchParams.get("university_code") ?? undefined,
  }).slice(0, 200)

  return NextResponse.json({
    count: data.length,
    data,
    message:
      data.length > 0
        ? "查询成功，结果来自已导入的官方投档线数据。"
        : "暂无可信投档线数据。",
  })
}
