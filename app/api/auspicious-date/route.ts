import { NextResponse } from "next/server"

import {
  generateAuspiciousDates,
  type AuspiciousDateRequest,
} from "@/lib/traditional-culture"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AuspiciousDateRequest
    return NextResponse.json(generateAuspiciousDates(body))
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "查询失败" },
      { status: 400 },
    )
  }
}
