import type { Metadata } from "next"

import { PdfConverter } from "@/components/pdf-converter"
import { SectionHeading } from "@/components/section-heading"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "PDF 转 Word - 文本 PDF 与扫描件 OCR",
  description: "在线把文本型 PDF、扫描件 PDF、图片版 PDF 转成可编辑 Word 文件。",
}

export default function PdfToWordPage() {
  return (
    <section className="page-section">
      <div className="container">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <SectionHeading
            title="PDF 转 Word"
            description="上传 PDF 后先进行快速文字提取；如果是扫描件或图片版 PDF，会自动切换到浏览器端 OCR 并生成可下载的 .docx Word 文件。"
          />
          <Badge variant="outline" className="bg-white">
            文本 + OCR
          </Badge>
        </div>
        <PdfConverter />
      </div>
    </section>
  )
}
