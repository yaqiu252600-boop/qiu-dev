import { NextResponse } from "next/server"

import { getPdfToWordStatus } from "@/lib/pdf-to-word-engine"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json(getPdfToWordStatus())
}
