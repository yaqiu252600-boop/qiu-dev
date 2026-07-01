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
            description="上传文本型 PDF，在线生成可下载的可编辑 Word 文件。当前版本不依赖本机转换程序，部署后可直接在网页使用。"
          />
          <Badge variant="outline" className="bg-white">
            在线转换
          </Badge>
        </div>
        <PdfConverter />
      </div>
    </section>
  )
}
