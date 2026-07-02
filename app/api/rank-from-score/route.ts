import { NextResponse } from "next/server"

import {
  getTrustedDataServiceStatus,
  rankFromScore,
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
      },
      { status: 503 },
    )
  }

  const url = new URL(request.url)
  const province = url.searchParams.get("province")
  const year = Number(url.searchParams.get("year"))
  const subjectType = url.searchParams.get("subject_type")
  const score = Number(url.searchParams.get("score"))

  if (!province || !year || !subjectType || Number.isNaN(score)) {
    return NextResponse.json(
      { error: "请提供 province、year、subject_type、score。" },
      { status: 400 },
    )
  }

  const result = rankFromScore({
    province,
    year,
    subject_type: subjectType,
    score,
  })

  if (!result) {
    return NextResponse.json(
      {
        error:
          "暂无已校验的一分一段数据，无法进行可信位次换算。",
      },
      { status: 404 },
    )
  }

  return NextResponse.json({ data: result })
}
