import { execFile } from "child_process"
import { randomUUID } from "crypto"
import fs from "fs/promises"
import path from "path"
import { promisify } from "util"

const execFileAsync = promisify(execFile)

const jobRoot = path.join(process.cwd(), "work", "pdf-to-word", "jobs")

export type ConversionResult = {
  jobId: string
  fileName: string
  outputPath: string
  enginePath: string
}

function safeBaseName(name: string) {
  return name
    .replace(/\.pdf$/i, "")
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "converted"
}

function getEngineCandidates() {
  const userProfile = process.env.USERPROFILE ?? ""
  const configuredPath = process.env.PDF_TO_WORD_ENGINE_PATH

  return [
    configuredPath,
    path.join(
      userProfile,
      "Documents",
      "Codex",
      "2026-06-24",
      "ba",
      "outputs",
      "PDF转Word助手.exe",
    ),
    path.join(
      userProfile,
      "Documents",
      "Codex",
      "2026-06-24",
      "ba",
      "work",
      "dist_final",
      "PDFToWordAssistant.exe",
    ),
  ].filter((candidate): candidate is string => Boolean(candidate))
}

async function fileExists(filePath: string) {
  try {
    const stat = await fs.stat(filePath)
    return stat.isFile()
  } catch {
    return false
  }
}

export async function findPdfToWordEngine() {
  for (const candidate of getEngineCandidates()) {
    if (await fileExists(candidate)) {
      return candidate
    }
  }

  return null
}

export async function convertPdfToWord(file: File): Promise<ConversionResult> {
  const enginePath = await findPdfToWordEngine()

  if (!enginePath) {
    throw new Error(
      "未找到 PDF 转 Word 转换引擎。请设置 PDF_TO_WORD_ENGINE_PATH，或保留旧工具输出目录中的 PDF转Word助手.exe。",
    )
  }

  const jobId = randomUUID()
  const baseName = safeBaseName(file.name)
  const fileName = `${baseName}.docx`
  const jobDir = path.join(jobRoot, jobId)
  const inputPath = path.join(jobDir, "input.pdf")
  const outputPath = path.join(jobDir, fileName)

  await fs.mkdir(jobDir, { recursive: true })
  await fs.writeFile(inputPath, Buffer.from(await file.arrayBuffer()))

  try {
    await execFileAsync(enginePath, ["--headless-convert", inputPath, "--output", outputPath], {
      timeout: 10 * 60 * 1000,
      windowsHide: true,
      maxBuffer: 10 * 1024 * 1024,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "转换失败"
    throw new Error(`转换引擎执行失败：${message}`)
  }

  const stat = await fs.stat(outputPath).catch(() => null)

  if (!stat || stat.size < 1024) {
    throw new Error("转换引擎没有生成有效的 Word 文件")
  }

  return {
    jobId,
    fileName,
    outputPath,
    enginePath,
  }
}

export function getConvertedFilePath(jobId: string, fileName: string) {
  if (!/^[a-f0-9-]{36}$/i.test(jobId)) {
    return null
  }

  const safeName = fileName.replace(/[/\\]/g, "")

  if (!safeName.endsWith(".docx")) {
    return null
  }

  return path.join(jobRoot, jobId, safeName)
}
