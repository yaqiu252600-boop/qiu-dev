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
  let rank = rankParam ? Number(rankParam) : undefined
  let convertedRankFromScore = false

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

    if (converted) {
      rank = converted.cumulative_count
      convertedRankFromScore = true
    }
  }

  const result = recommendFromTrustedData({
    province,
    year,
    subject_type: subjectType,
    score,
    rank,
    converted_rank_from_score: convertedRankFromScore,
    batch_name: url.searchParams.get("batch_name") ?? undefined,
  })

  if (!result.ok) {
    return NextResponse.json(result, { status: 404 })
  }

  return NextResponse.json(result)
}
