import type { Metadata } from "next"

import { SectionHeading } from "@/components/section-heading"
import { Badge } from "@/components/ui/badge"
import { VideoToolsWorkbench } from "@/components/video-tools-workbench"

export const metadata: Metadata = {
  title: "视频文案提取与下载 | qiu.dev",
  description: "输入公开视频链接，提取视频简介或字幕文案，并选择可用清晰度下载视频。",
}

export default function VideoToolsPage() {
  return (
    <section className="page-section">
      <div className="container">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <SectionHeading
            title="视频文案提取与下载"
            description="输入公开视频链接，提取标题、简介、字幕文案，并选择可用清晰度下载视频。"
          />
          <Badge variant="outline" className="bg-white">
            公开视频工具
          </Badge>
        </div>
        <VideoToolsWorkbench />
      </div>
    </section>
  )
}
