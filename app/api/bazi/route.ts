import { NextResponse } from "next/server"

import { generateBaziReport, type BaziRequest } from "@/lib/traditional-culture"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BaziRequest
    return NextResponse.json(generateBaziReport(body))
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "排盘失败，请检查输入" },
      { status: 400 },
    )
  }
}
