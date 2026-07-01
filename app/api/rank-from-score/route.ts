import { NextResponse } from "next/server"

import { rankFromScore } from "@/lib/trusted-gaokao"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export function GET(request: Request) {
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
          "暂无可信一分一段/逐分段数据，不能用分数换算位次。请以省教育考试院官方发布为准。",
      },
      { status: 404 },
    )
  }

  return NextResponse.json({ data: result })
}
