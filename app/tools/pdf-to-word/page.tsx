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
            description="调用本地或自托管转换引擎，把 PDF 转成可编辑的 Word 文档。线上环境需要先配置转换服务。"
          />
          <Badge variant="outline" className="bg-white">
            自托管转换模块
          </Badge>
        </div>
        <PdfConverter />
      </div>
    </section>
  )
}
