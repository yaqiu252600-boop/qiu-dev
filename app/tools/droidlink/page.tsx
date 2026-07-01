import type { Metadata } from "next"
import Link from "next/link"
import {
  Download,
  FileArchive,
  FileText,
  Laptop,
  Smartphone,
} from "lucide-react"

import { SectionHeading } from "@/components/section-heading"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "DroidLink 手机电脑连接工具",
  description:
    "下载 DroidLink Windows 程序和 Android APK，在同一局域网内完成手机与电脑的配对和双向文件互传。",
}

const downloads = [
  {
    title: "Windows 端",
    description: "单文件程序，启动本地连接服务并管理电脑侧收发。",
    href: "/downloads/droidlink/DroidLink-Windows-v0.2.exe",
    fileName: "DroidLink-Windows-v0.2.exe",
    size: "14.1 MB",
    icon: Laptop,
    primary: true,
  },
  {
    title: "Android 端",
    description: "原生 APK，连接电脑、上传手机文件并下载电脑共享文件。",
    href: "/downloads/droidlink/DroidLink-Android-v0.2.apk",
    fileName: "DroidLink-Android-v0.2.apk",
    size: "3.3 MB",
    icon: Smartphone,
    primary: true,
  },
  {
    title: "源码包",
    description: "包含 Windows、Android、测试和继续开发所需源码。",
    href: "/downloads/droidlink/DroidLink-Source-v0.2.zip",
    fileName: "DroidLink-Source-v0.2.zip",
    size: "34 KB",
    icon: FileArchive,
    primary: false,
  },
  {
    title: "文档包",
    description: "构建、权限、FAQ 和测试清单。",
    href: "/downloads/droidlink/DroidLink-Documentation-v0.2.zip",
    fileName: "DroidLink-Documentation-v0.2.zip",
    size: "5 KB",
    icon: FileText,
    primary: false,
  },
  {
    title: "使用说明",
    description: "快速安装和连接说明。",
    href: "/downloads/droidlink/DroidLink-Usage-v0.2.txt",
    fileName: "DroidLink-Usage-v0.2.txt",
    size: "1 KB",
    icon: FileText,
    primary: false,
  },
]

const completed = [
  "Windows 单文件 EXE",
  "Android 原生 APK",
  "二维码或 6 位码配对",
  "手机与电脑双向文件传输",
  "传输历史和接收目录持久化",
]

const nextSteps = [
  "手机投屏到电脑",
  "鼠标键盘控制手机",
  "剪贴板同步",
  "USB 和蓝牙连接",
]

export default function DroidLinkToolPage() {
  return (
    <section className="page-section">
      <div className="container">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <SectionHeading
            title="DroidLink"
            description="下载 Windows 端和 Android 端，在同一局域网内完成手机与电脑配对和文件互传。"
          />
          <Badge variant="outline" className="bg-white">
            V0.2 可用版本
          </Badge>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-5 md:grid-cols-2">
            {downloads.map((item) => {
              const Icon = item.icon

              return (
                <Card key={item.href} className="flex h-full flex-col bg-white">
                  <CardHeader>
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto space-y-3">
                    <div className="text-sm text-muted-foreground">
                      {item.fileName} · {item.size}
                    </div>
                    <Button asChild variant={item.primary ? "default" : "outline"}>
                      <Link href={item.href}>
                        <Download aria-hidden="true" />
                        下载
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="space-y-5">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">当前已完成</CardTitle>
                <CardDescription>这是已交付的 V0.2 本地互联版本。</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {completed.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">下一阶段</CardTitle>
                <CardDescription>投屏和控制还没有放进当前安装包。</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {nextSteps.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
