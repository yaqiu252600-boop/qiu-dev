import { NextResponse } from "next/server"

import {
  rankFromScore,
  recommendFromTrustedData,
} from "@/lib/trusted-gaokao"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export function GET(request: Request) {
  const url = new URL(request.url)
  const province = url.searchParams.get("province")
  const year = Number(url.searchParams.get("year"))
  const subjectType = url.searchParams.get("subject_type")
  const score = Number(url.searchParams.get("score"))
  const rankParam = url.searchParams.get("rank")
  const rank = rankParam ? Number(rankParam) : undefined

  if (!province || !year || !subjectType || Number.isNaN(score)) {
    return NextResponse.json(
      { error: "请提供 province、year、subject_type、score。" },
      { status: 400 },
    )
  }

  if (rankParam && Number.isNaN(rank)) {
    return NextResponse.json({ error: "rank 必须是数字。" }, { status: 400 })
  }

  if (!rank) {
    const converted = rankFromScore({
      province,
      year,
      subject_type: subjectType,
      score,
    })

    if (!converted) {
      return NextResponse.json(
        {
          error:
            "暂无可信一分一段/逐分段数据，不能由分数换算位次。你可以补充官方位次，或先查看投档线查询结果。",
        },
        { status: 404 },
      )
    }
  }

  const result = recommendFromTrustedData({
    province,
    year,
    subject_type: subjectType,
    score,
    rank,
    batch_name: url.searchParams.get("batch_name") ?? undefined,
  })

  if (!result.ok) {
    return NextResponse.json(result, { status: 404 })
  }

  return NextResponse.json(result)
}
