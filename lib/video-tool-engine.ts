import { execFile } from "child_process"
import { createHash, randomUUID } from "crypto"
import { lookup } from "dns/promises"
import fs from "fs/promises"
import os from "os"
import path from "path"
import { promisify } from "util"

const execFileAsync = promisify(execFile)

const DEFAULT_TIMEOUT_MS = 60 * 1000
const DOWNLOAD_TIMEOUT_MS = 2 * 60 * 1000
const MAX_STDOUT_BUFFER = 24 * 1024 * 1024
const MAX_SUBTITLE_BYTES = 5 * 1024 * 1024
const MAX_TEXT_LENGTH = 120_000
const JOB_TTL_MS = 60 * 60 * 1000

const releaseApiUrl = "https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest"

let binaryPromise: Promise<string> | null = null

export type VideoFormatOption = {
  id: string
  label: string
  quality: string
  ext: string
  sizeLabel: string
  height?: number
  fps?: number
}

export type VideoTranscript = {
  text: string
  language?: string
  source: "manual" | "automatic" | "metadata"
  available: boolean
}

export type VideoInspectionResult = {
  title: string
  description: string
  uploader: string
  durationLabel: string
  webpageUrl: string
  transcript: VideoTranscript
  copyText: string
  formats: VideoFormatOption[]
  notice: string
}

export type VideoToolStatus = {
  available: boolean
  mode: "local" | "auto-download" | "unavailable"
  message: string
}

type YtDlpRelease = {
  tag_name?: string
  assets?: Array<{
    name?: string
    browser_download_url?: string
  }>
}

type CaptionEntry = {
  url?: string
  ext?: string
  name?: string
}

type YtDlpFormat = {
  format_id?: string
  format_note?: string
  ext?: string
  acodec?: string
  vcodec?: string
  height?: number
  width?: number
  fps?: number
  filesize?: number
  filesize_approx?: number
  tbr?: number
  protocol?: string
}

type YtDlpInfo = {
  title?: string
  description?: string
  uploader?: string
  channel?: string
  duration?: number
  webpage_url?: string
  subtitles?: Record<string, CaptionEntry[]>
  automatic_captions?: Record<string, CaptionEntry[]>
  formats?: YtDlpFormat[]
}

function getEnvFlag(name: string, defaultValue = true) {
  const value = process.env[name]

  if (value === undefined) {
    return defaultValue
  }

  return !["0", "false", "no", "off"].includes(value.toLowerCase())
}

function getWorkDir() {
  return path.join(process.cwd(), "work", "video-tools")
}

function getRuntimeCacheDir() {
  if (process.env.VIDEO_TOOL_BIN_DIR) {
    return process.env.VIDEO_TOOL_BIN_DIR
  }

  if (process.platform !== "win32" && process.env.NODE_ENV === "production") {
    return path.join(os.tmpdir(), "qiu-video-tools", "bin")
  }

  return path.join(getWorkDir(), "bin")
}

function getJobRoot() {
  if (process.env.VIDEO_TOOL_JOB_DIR) {
    return process.env.VIDEO_TOOL_JOB_DIR
  }

  if (process.platform !== "win32" && process.env.NODE_ENV === "production") {
    return path.join(os.tmpdir(), "qiu-video-tools", "jobs")
  }

  return path.join(getWorkDir(), "jobs")
}

async function fileExists(filePath: string) {
  try {
    const stat = await fs.stat(filePath)
    return stat.isFile() && stat.size > 1024
  } catch {
    return false
  }
}

function getNodeModuleBinaryCandidates() {
  const fileName = process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp"

  return [
    path.join(process.cwd(), "node_modules", "yt-dlp-exec", "bin", fileName),
    path.join(process.cwd(), "node_modules", "youtube-dl-exec", "bin", fileName),
  ]
}

async function getSystemYtDlp() {
  try {
    await execFileAsync("yt-dlp", ["--version"], {
      timeout: 3500,
      windowsHide: true,
      maxBuffer: 1024 * 1024,
    })
    return "yt-dlp"
  } catch {
    return null
  }
}

async function findExistingYtDlp() {
  const configuredPath = process.env.VIDEO_TOOL_YTDLP_PATH ?? process.env.YTDLP_PATH

  if (configuredPath && (await fileExists(configuredPath))) {
    return configuredPath
  }

  for (const candidate of getNodeModuleBinaryCandidates()) {
    if (await fileExists(candidate)) {
      return candidate
    }
  }

  return getSystemYtDlp()
}

function getReleaseAssetName() {
  if (process.platform === "win32") {
    if (process.arch === "arm64") {
      return "yt-dlp_arm64.exe"
    }

    if (process.arch === "ia32") {
      return "yt-dlp_x86.exe"
    }

    return "yt-dlp.exe"
  }

  if (process.platform === "linux") {
    return process.arch === "arm64" ? "yt-dlp_linux_aarch64" : "yt-dlp_linux"
  }

  if (process.platform === "darwin") {
    return "yt-dlp_macos"
  }

  return null
}

async function fetchText(url: string, timeoutMs = 20_000) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "qiu.dev-video-tools/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`请求失败：${response.status}`)
    }

    return response.text()
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchArrayBuffer(url: string, timeoutMs = 45_000) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "qiu.dev-video-tools/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`下载失败：${response.status}`)
    }

    return response.arrayBuffer()
  } finally {
    clearTimeout(timeout)
  }
}

async function downloadOfficialYtDlp() {
  const assetName = getReleaseAssetName()

  if (!assetName) {
    throw new Error("当前服务器系统暂不支持自动准备视频处理器。")
  }

  const cacheDir = getRuntimeCacheDir()
  const targetPath = path.join(cacheDir, assetName)

  if (await fileExists(targetPath)) {
    return targetPath
  }

  const release = (await fetch(releaseApiUrl, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "qiu.dev-video-tools/1.0",
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`无法读取视频处理器发布信息：${response.status}`)
    }

    return response.json()
  })) as YtDlpRelease

  const asset = release.assets?.find((item) => item.name === assetName)
  const checksumAsset = release.assets?.find((item) => item.name === "SHA2-256SUMS")

  if (!asset?.browser_download_url || !checksumAsset?.browser_download_url) {
    throw new Error("无法找到适用于当前系统的视频处理器发布文件。")
  }

  const [binaryBuffer, checksumText] = await Promise.all([
    fetchArrayBuffer(asset.browser_download_url),
    fetchText(checksumAsset.browser_download_url),
  ])

  const expectedHash = checksumText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.endsWith(` ${assetName}`))
    ?.split(/\s+/)[0]

  if (!expectedHash) {
    throw new Error("无法校验视频处理器文件。")
  }

  const actualHash = createHash("sha256")
    .update(Buffer.from(binaryBuffer))
    .digest("hex")

  if (actualHash !== expectedHash) {
    throw new Error("视频处理器文件校验失败。")
  }

  await fs.mkdir(cacheDir, { recursive: true })
  await fs.writeFile(targetPath, Buffer.from(binaryBuffer))

  if (process.platform !== "win32") {
    await fs.chmod(targetPath, 0o755)
  }

  return targetPath
}

async function getYtDlpBinary(options: { allowDownload: boolean }) {
  const existing = await findExistingYtDlp()

  if (existing) {
    return existing
  }

  if (!options.allowDownload || !getEnvFlag("VIDEO_TOOL_AUTO_DOWNLOAD", true)) {
    return null
  }

  if (!binaryPromise) {
    binaryPromise = downloadOfficialYtDlp().catch((error) => {
      binaryPromise = null
      throw error
    })
  }

  return binaryPromise
}

export async function getVideoToolStatus(): Promise<VideoToolStatus> {
  const existing = await getYtDlpBinary({ allowDownload: false })

  if (existing) {
    return {
      available: true,
      mode: "local",
      message: "视频处理器已就绪。",
    }
  }

  if (getEnvFlag("VIDEO_TOOL_AUTO_DOWNLOAD", true) && getReleaseAssetName()) {
    return {
      available: true,
      mode: "auto-download",
      message: "首次解析时会自动准备视频处理器。",
    }
  }

  return {
    available: false,
    mode: "unavailable",
    message: "当前环境还没有可用的视频处理器。",
  }
}

function friendlyYtDlpError(error: unknown) {
  if (!(error instanceof Error)) {
    return "视频处理失败。"
  }

  const details = "stderr" in error ? String(error.stderr) : error.message
  const message = details
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(-3)
    .join(" ")

  return message || error.message || "视频处理失败。"
}

async function runYtDlp(args: string[], timeoutMs = DEFAULT_TIMEOUT_MS) {
  const binary = await getYtDlpBinary({ allowDownload: true })

  if (!binary) {
    throw new Error("当前环境还没有可用的视频处理器。")
  }

  try {
    const result = await execFileAsync(binary, args, {
      timeout: timeoutMs,
      windowsHide: true,
      maxBuffer: MAX_STDOUT_BUFFER,
      env: {
        ...process.env,
        LANG: "C.UTF-8",
        PYTHONIOENCODING: "utf-8",
      },
    })

    return result.stdout
  } catch (error) {
    throw new Error(friendlyYtDlpError(error))
  }
}

function isPrivateIpv4(address: string) {
  const parts = address.split(".").map((part) => Number(part))

  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return false
  }

  const [a, b] = parts

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  )
}

function isPrivateIpv6(address: string) {
  const lower = address.toLowerCase()

  if (lower === "::1" || lower === "::") {
    return true
  }

  if (lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80")) {
    return true
  }

  const mappedIpv4 = lower.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1]

  return mappedIpv4 ? isPrivateIpv4(mappedIpv4) : false
}

async function validatePublicVideoUrl(input: string) {
  const value = input.trim()

  if (!value || value.length > 2048) {
    throw new Error("请输入有效的视频链接。")
  }

  let url: URL

  try {
    url = new URL(value)
  } catch {
    throw new Error("请输入完整的视频链接。")
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("只支持 http 或 https 视频链接。")
  }

  if (url.username || url.password) {
    throw new Error("视频链接不能包含账号或密码信息。")
  }

  const hostname = url.hostname.toLowerCase()

  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local")
  ) {
    throw new Error("不支持本地或内网视频链接。")
  }

  let addresses: Array<{
    address: string
    family: number
  }>

  try {
    addresses = await lookup(hostname, { all: true, verbatim: true })
  } catch {
    throw new Error("无法解析这个视频链接的域名。")
  }

  if (
    addresses.some((address) =>
      address.family === 4
        ? isPrivateIpv4(address.address)
        : isPrivateIpv6(address.address),
    )
  ) {
    throw new Error("不支持本地或内网视频链接。")
  }

  return url.toString()
}

function formatDuration(seconds?: number) {
  if (!seconds || seconds <= 0) {
    return "未知"
  }

  const total = Math.round(seconds)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`
  }

  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

function formatSize(bytes?: number) {
  if (!bytes || bytes <= 0) {
    return "大小未知"
  }

  const mb = bytes / 1024 / 1024

  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(2)} GB`
  }

  return `${mb.toFixed(mb >= 100 ? 0 : 1)} MB`
}

function cleanText(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function stripHtml(text: string) {
  return text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function parseJson3Subtitle(text: string) {
  try {
    const data = JSON.parse(text) as {
      events?: Array<{
        segs?: Array<{
          utf8?: string
        }>
      }>
    }

    return cleanText(
      (data.events ?? [])
        .flatMap((event) => event.segs ?? [])
        .map((segment) => segment.utf8 ?? "")
        .join("")
        .replace(/\n+/g, "\n"),
    )
  } catch {
    return ""
  }
}

function parseCaptionText(text: string, ext?: string) {
  if (ext === "json3") {
    return parseJson3Subtitle(text)
  }

  if (["srv1", "srv2", "srv3", "ttml", "dfxp", "xml"].includes(ext ?? "")) {
    return cleanText(stripHtml(text))
  }

  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => stripHtml(line).trim())
    .filter((line) => {
      if (!line) {
        return false
      }

      if (/^(WEBVTT|Kind:|Language:|NOTE|STYLE|REGION)/i.test(line)) {
        return false
      }

      if (/^\d+$/.test(line)) {
        return false
      }

      return !/^\d{1,2}:\d{2}:\d{2}[.,]\d{3}\s+-->\s+/.test(line)
    })

  const deduped = lines.filter((line, index) => line !== lines[index - 1])

  return cleanText(deduped.join("\n"))
}

function pickCaptionTrack(captions?: Record<string, CaptionEntry[]>) {
  if (!captions) {
    return null
  }

  const preferredLanguages = [
    "zh-Hans",
    "zh-CN",
    "zh",
    "zh-Hant",
    "zh-TW",
    "en",
  ]
  const languages = [
    ...preferredLanguages.filter((language) => captions[language]?.length),
    ...Object.keys(captions).filter(
      (language) => !preferredLanguages.includes(language),
    ),
  ]
  const preferredExts = ["json3", "vtt", "srt", "srv3", "srv2", "srv1", "ttml"]

  for (const language of languages) {
    const entries = captions[language] ?? []
    const entry =
      preferredExts
        .map((ext) => entries.find((item) => item.ext === ext && item.url))
        .find(Boolean) ?? entries.find((item) => item.url)

    if (entry?.url) {
      return {
        language,
        entry,
      }
    }
  }

  return null
}

async function extractTranscript(info: YtDlpInfo): Promise<VideoTranscript> {
  const manual = pickCaptionTrack(info.subtitles)
  const automatic = pickCaptionTrack(info.automatic_captions)
  const selected = manual ?? automatic

  if (!selected) {
    return {
      text: cleanText(info.description ?? ""),
      source: "metadata",
      available: Boolean(cleanText(info.description ?? "")),
    }
  }

  try {
    const response = await fetch(selected.entry.url!, {
      headers: {
        "User-Agent": "qiu.dev-video-tools/1.0",
      },
    })

    if (!response.ok) {
      throw new Error("字幕请求失败。")
    }

    const contentLength = Number(response.headers.get("content-length") ?? 0)

    if (contentLength > MAX_SUBTITLE_BYTES) {
      throw new Error("字幕文件过大。")
    }

    const text = await response.text()

    if (text.length > MAX_SUBTITLE_BYTES) {
      throw new Error("字幕文件过大。")
    }

    const parsed = parseCaptionText(text, selected.entry.ext)

    return {
      text: parsed.slice(0, MAX_TEXT_LENGTH),
      language: selected.language,
      source: manual ? "manual" : "automatic",
      available: Boolean(parsed),
    }
  } catch {
    return {
      text: cleanText(info.description ?? ""),
      source: "metadata",
      available: Boolean(cleanText(info.description ?? "")),
    }
  }
}

function formatQuality(format: YtDlpFormat) {
  if (format.height) {
    return `${format.height}p${format.fps && format.fps > 30 ? ` ${format.fps}fps` : ""}`
  }

  return format.format_note ?? format.ext?.toUpperCase() ?? "默认清晰度"
}

function isUsableDownloadFormat(format: YtDlpFormat) {
  if (!format.format_id || !format.ext) {
    return false
  }

  if (format.vcodec === "none" || format.acodec === "none") {
    return false
  }

  if (!["mp4", "webm", "m4v", "mov"].includes(format.ext)) {
    return false
  }

  if (format.protocol?.includes("m3u8") || format.protocol?.includes("dash")) {
    return false
  }

  return true
}

function buildFormatOptions(formats?: YtDlpFormat[]) {
  const seen = new Set<string>()

  return (formats ?? [])
    .filter(isUsableDownloadFormat)
    .sort((a, b) => {
      const heightDiff = (b.height ?? 0) - (a.height ?? 0)

      if (heightDiff !== 0) {
        return heightDiff
      }

      return (b.tbr ?? 0) - (a.tbr ?? 0)
    })
    .filter((format) => {
      const key = `${format.format_id}-${format.height ?? 0}-${format.ext}`

      if (seen.has(key)) {
        return false
      }

      seen.add(key)
      return true
    })
    .slice(0, 12)
    .map((format) => {
      const quality = formatQuality(format)
      const sizeLabel = formatSize(format.filesize ?? format.filesize_approx)
      const ext = format.ext ?? "mp4"

      return {
        id: format.format_id!,
        label: `${quality} · ${ext.toUpperCase()} · ${sizeLabel}`,
        quality,
        ext,
        sizeLabel,
        height: format.height,
        fps: format.fps,
      }
    })
}

function buildCopyText(info: YtDlpInfo, transcript: VideoTranscript) {
  const title = cleanText(info.title ?? "未命名视频")
  const uploader = cleanText(info.uploader ?? info.channel ?? "")
  const description = cleanText(info.description ?? "")
  const parts = [`标题：${title}`]

  if (uploader) {
    parts.push(`作者：${uploader}`)
  }

  if (description) {
    parts.push(`简介：\n${description}`)
  }

  if (transcript.available && transcript.text && transcript.source !== "metadata") {
    parts.push(`字幕文案：\n${transcript.text}`)
  }

  return parts.join("\n\n").slice(0, MAX_TEXT_LENGTH)
}

export async function inspectVideoUrl(input: string): Promise<VideoInspectionResult> {
  const videoUrl = await validatePublicVideoUrl(input)
  const stdout = await runYtDlp(
    [
      "--dump-single-json",
      "--no-playlist",
      "--no-warnings",
      "--ignore-config",
      "--socket-timeout",
      "15",
      videoUrl,
    ],
    DEFAULT_TIMEOUT_MS,
  )
  const info = JSON.parse(stdout) as YtDlpInfo
  const transcript = await extractTranscript(info)
  const formats = buildFormatOptions(info.formats)
  const copyText = buildCopyText(info, transcript)

  return {
    title: cleanText(info.title ?? "未命名视频"),
    description: cleanText(info.description ?? ""),
    uploader: cleanText(info.uploader ?? info.channel ?? ""),
    durationLabel: formatDuration(info.duration),
    webpageUrl: info.webpage_url ?? videoUrl,
    transcript,
    copyText,
    formats,
    notice: "仅支持公开视频与可直接下载的合并音视频格式；受平台限制、登录态或 DRM 保护的视频不会处理。",
  }
}

function validateFormatId(input: string) {
  const value = input.trim()

  if (!/^[a-zA-Z0-9._:-]{1,80}$/.test(value)) {
    throw new Error("无效的视频清晰度。")
  }

  return value
}

async function sweepOldJobs() {
  const root = getJobRoot()
  const now = Date.now()
  const entries = await fs.readdir(root, { withFileTypes: true }).catch(() => [])

  await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const dir = path.join(root, entry.name)
        const stat = await fs.stat(dir).catch(() => null)

        if (stat && now - stat.mtimeMs > JOB_TTL_MS) {
          await fs.rm(dir, { recursive: true, force: true })
        }
      }),
  )
}

function safeDownloadName(fileName: string) {
  return (
    fileName
      .replace(/[/\\]/g, "")
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9_. -]+/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120) || "video"
  )
}

export async function downloadVideoFile(inputUrl: string, inputFormatId: string) {
  const videoUrl = await validatePublicVideoUrl(inputUrl)
  const formatId = validateFormatId(inputFormatId)
  const jobId = randomUUID()
  const jobRoot = getJobRoot()
  const jobDir = path.join(jobRoot, jobId)
  const maxFileSize = process.env.VIDEO_TOOL_MAX_FILESIZE ?? "250M"

  await fs.mkdir(jobDir, { recursive: true })
  await sweepOldJobs()

  await runYtDlp(
    [
      "--no-playlist",
      "--no-warnings",
      "--ignore-config",
      "--no-progress",
      "--restrict-filenames",
      "--max-filesize",
      maxFileSize,
      "-f",
      formatId,
      "-o",
      path.join(jobDir, "%(title).80s-%(format_id)s.%(ext)s"),
      videoUrl,
    ],
    DOWNLOAD_TIMEOUT_MS,
  )

  const files = await fs.readdir(jobDir, { withFileTypes: true })
  const candidates = await Promise.all(
    files
      .filter((entry) => entry.isFile() && !entry.name.endsWith(".part"))
      .map(async (entry) => {
        const filePath = path.join(jobDir, entry.name)
        const stat = await fs.stat(filePath)

        return {
          filePath,
          fileName: safeDownloadName(entry.name),
          size: stat.size,
        }
      }),
  )
  const selected = candidates.sort((a, b) => b.size - a.size)[0]

  if (!selected || selected.size < 1024) {
    throw new Error("没有生成可下载的视频文件。")
  }

  return selected
}
