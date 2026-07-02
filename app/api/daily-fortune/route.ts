import { NextResponse } from "next/server"

import { generateDailyFortune } from "@/lib/traditional-culture"

export function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date") ?? undefined

  try {
    return NextResponse.json(generateDailyFortune(date))
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "生成失败" },
      { status: 400 },
    )
  }
}
