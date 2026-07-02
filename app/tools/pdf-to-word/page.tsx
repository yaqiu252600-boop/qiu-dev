import type { Metadata } from "next"

import { PdfConverter } from "@/components/pdf-converter"
import { SectionHeading } from "@/components/section-heading"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "PDF 转 Word - 文本 PDF 与扫描件版式重建",
  description:
    "在线把文本型 PDF 快速转成 Word；扫描件和图片版 PDF 会在浏览器端高清渲染、裁白边并重建表格版式。",
}

export default function PdfToWordPage() {
  return (
    <section className="page-section">
      <div className="container">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <SectionHeading
            title="PDF 转 Word"
            description="上传 PDF 后先进行快速文字提取；如果是扫描件或图片版 PDF，会自动切换到浏览器端版式重建，优先保证 Word 文件可阅读、不散版。"
          />
          <Badge variant="outline" className="bg-white">
            文本 + 扫描件版式
          </Badge>
        </div>
        <PdfConverter />
      </div>
    </section>
  )
}
