import Link from "next/link"
import { Github, Mail } from "lucide-react"

import { SectionHeading } from "@/components/section-heading"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function ContactPage() {
  return (
    <section className="page-section">
      <div className="container">
        <SectionHeading
          title="联系我"
          description="欢迎交流 Web 项目、工具产品、AI 应用和长期构建相关的话题。"
        />
        <Card className="max-w-2xl bg-white">
          <CardHeader>
            <CardTitle>找到 qiu</CardTitle>
            <CardDescription>
              当前链接为占位地址，上线前可以替换为真实邮箱和 GitHub 主页。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="mailto:hello@example.com">
                <Mail aria-hidden="true" />
                邮件联系
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="https://github.com/" target="_blank">
                <Github aria-hidden="true" />
                GitHub
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
