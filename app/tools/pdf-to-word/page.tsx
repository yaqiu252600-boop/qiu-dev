import { PdfConverter } from "@/components/pdf-converter"
import { SectionHeading } from "@/components/section-heading"
import { Badge } from "@/components/ui/badge"

export default function PdfToWordPage() {
  return (
    <section className="page-section">
      <div className="container">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <SectionHeading
            title="PDF 转 Word"
            description="调用本地转换引擎，把 PDF 转成可编辑的 Word 文档。适合在本机运行和处理文件。"
          />
          <Badge variant="outline" className="bg-white">
            本地转换模块
          </Badge>
        </div>
        <PdfConverter />
      </div>
    </section>
  )
}
