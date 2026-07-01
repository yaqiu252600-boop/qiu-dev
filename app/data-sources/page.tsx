import type { Metadata } from "next"

import { SectionHeading } from "@/components/section-heading"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSourceManifest } from "@/lib/trusted-gaokao"

export const metadata: Metadata = {
  title: "数据来源 | qiu.dev",
  description: "高考志愿辅助系统已导入和待校验数据来源清单。",
}

const statusText: Record<string, string> = {
  success: "已导入",
  missing: "缺失",
  pending_review: "待校验",
  failed: "失败",
}

export default function DataSourcesPage() {
  const sources = getSourceManifest()

  return (
    <section className="page-section">
      <div className="container">
        <SectionHeading
          title="数据来源"
          description="这里只展示已登记来源。所有正式入库数据必须保留 source_name、source_url 和 source_updated_at。"
        />
        <div className="grid gap-4">
          {sources.map((source) => (
            <Card key={`${source.data_type}-${source.province}-${source.year}`}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>
                      {source.data_type} / {source.province} / {source.year}
                    </CardTitle>
                    <CardDescription>
                      {source.source_name} /{" "}
                      {source.source_updated_at || "更新时间未标注"}
                    </CardDescription>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
                    {statusText[source.status] ?? source.status} /{" "}
                    {source.row_count} 行
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
                <a
                  href={source.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary"
                >
                  {source.source_url}
                </a>
                <div>
                  <div className="font-medium text-foreground">原始文件</div>
                  <p>
                    {source.raw_files.length
                      ? source.raw_files.join("、")
                      : "暂无"}
                  </p>
                </div>
                <div>
                  <div className="font-medium text-foreground">清洗文件</div>
                  <p>
                    {source.processed_files.length
                      ? source.processed_files.join("、")
                      : "暂无"}
                  </p>
                </div>
                <p>{source.notes}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
