import { NextResponse } from "next/server"

import { generateNameSuggestions, type NameRequest } from "@/lib/traditional-culture"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as NameRequest
    return NextResponse.json(generateNameSuggestions(body))
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "生成失败" },
      { status: 400 },
    )
  }
}
