import { NextResponse } from "next/server"

import { findUniversityById } from "@/lib/trusted-gaokao"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const university = findUniversityById(params.id)

  if (!university) {
    return NextResponse.json(
      { error: "暂无可信院校数据，未找到对应学校。" },
      { status: 404 },
    )
  }

  return NextResponse.json({ data: university })
}
