import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"

import { SectionHeading } from "@/components/section-heading"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  getProvinceDataOverview,
  getSourceManifest,
} from "@/lib/trusted-gaokao"

export const metadata: Metadata = {
  title: "数据来源 | qiu.dev",
  description: "高考志愿辅助系统已导入、待校验和缺失数据来源清单。",
}

const statusText: Record<string, string> = {
  verified: "verified",
  imported: "imported",
  pending_review: "pending_review",
  partial: "partial",
  missing: "missing",
  blocked: "blocked",
  failed: "failed",
}

function capabilityText(value: boolean) {
  return value ? "是" : "否"
}

const provinceNotices: Record<string, string> = {
  山东:
    "山东官方投档表包含最低位次和投档计划数，未包含最低分。本工具不会反推最低分，仅提供历史位次参考。",
}

export default function DataSourcesPage({
  searchParams,
}: {
  searchParams?: { province?: string }
}) {
  const sources = getSourceManifest()
  const provinceStatuses = getProvinceDataOverview()
  const selectedProvince = searchParams?.province
  const selectedOverview = selectedProvince
    ? provinceStatuses.find((item) => item.province === selectedProvince)
    : undefined
  const visibleSources = selectedProvince
    ? sources.filter((source) => source.province === selectedProvince)
    : sources

  return (
    <section className="page-section">
      <div className="container">
        <SectionHeading
          title="数据来源"
          description="按省份查看官方源发现、导入状态和不可用原因。正式入库数据必须保留 source_name、source_url 和 source_updated_at。"
        />

        <div className="mb-6 flex flex-wrap gap-2">
          <FilterLink href="/data-sources" active={!selectedProvince}>
            全部
          </FilterLink>
          {provinceStatuses.map((item) => (
            <FilterLink
              key={item.province}
              href={`/data-sources?province=${encodeURIComponent(item.province)}`}
              active={selectedProvince === item.province}
            >
              {item.province}
            </FilterLink>
          ))}
        </div>

        {selectedOverview ? (
          <Card className="mb-6 bg-white">
            <CardHeader>
              <CardTitle>{selectedOverview.province} 数据状态</CardTitle>
              <CardDescription>
                {selectedOverview.exam_authority_name} /{" "}
                {selectedOverview.handled_independently
                  ? "由独立任务处理中"
                  : `第 ${selectedOverview.priority_batch} 批`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <StatusItem label="高校基础库" value={selectedOverview.universities_status} />
                <StatusItem label="一分一段" value={selectedOverview.score_segments_status} />
                <StatusItem
                  label="招生计划"
                  value={selectedOverview.admission_plans_status}
                />
                <StatusItem
                  label="志愿规则"
                  value={selectedOverview.province_rules_status}
                />
                <StatusItem
                  label="2023 投档线"
                  value={selectedOverview.admission_scores_by_year["2023"]}
                />
                <StatusItem
                  label="2024 投档线"
                  value={selectedOverview.admission_scores_by_year["2024"]}
                />
                <StatusItem
                  label="2025 投档线"
                  value={selectedOverview.admission_scores_by_year["2025"]}
                />
              </div>
              <div>
                <div className="font-medium text-foreground">当前支持能力</div>
                <p>{selectedOverview.support_capabilities.join("、")}</p>
              </div>
              {provinceNotices[selectedOverview.province] ? (
                <div className="rounded-md border border-sky-200 bg-sky-50 p-3 text-sky-900">
                  {provinceNotices[selectedOverview.province]}
                </div>
              ) : null}
              <div>
                <div className="font-medium text-foreground">数据年份覆盖</div>
                <p>
                  2023：{selectedOverview.admission_scores_by_year["2023"]}；2024：
                  {selectedOverview.admission_scores_by_year["2024"]}；2025：
                  {selectedOverview.admission_scores_by_year["2025"]}
                </p>
              </div>
              <div>
                <div className="font-medium text-foreground">不可用原因</div>
                <ul className="mt-2 space-y-1">
                  {selectedOverview.unavailable_reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
              <div className="grid gap-2 text-xs text-slate-700 md:grid-cols-2">
                <a href={selectedOverview.official_site} className="text-primary">
                  {selectedOverview.official_site}
                </a>
                <a href={selectedOverview.gaokao_channel_url} className="text-primary">
                  {selectedOverview.gaokao_channel_url}
                </a>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4">
          {visibleSources.map((source) => (
            <Card
              key={`${source.data_type}-${source.province}-${source.year}-${source.source_url}`}
            >
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
                    {source.imported_rows ?? source.row_count ?? 0} 行
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
                <a
                  href={source.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary"
                >
                  {source.source_url}
                </a>
                <div className="grid gap-2 rounded-md bg-slate-50 p-3 text-xs text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
                  <Capability label="是否可查询" value={source.queryable} />
                  <Capability
                    label="可参与分数参考"
                    value={source.usable_for_score_reference}
                  />
                  <Capability
                    label="可参与位次参考"
                    value={source.usable_for_rank_recommendation}
                  />
                  <Capability
                    label="可参与完整推荐"
                    value={source.usable_for_admission_plan_recommendation}
                  />
                </div>
                <div>
                  <div className="font-medium text-foreground">原始文件</div>
                  <p>
                    {source.raw_files?.length
                      ? source.raw_files.join("、")
                      : "暂无"}
                  </p>
                </div>
                <div>
                  <div className="font-medium text-foreground">清洗文件</div>
                  <p>
                    {source.processed_files?.length
                      ? source.processed_files.join("、")
                      : "暂无"}
                  </p>
                </div>
                {source.missing_fields?.length ? (
                  <div>
                    <div className="font-medium text-foreground">缺失字段</div>
                    <p>{source.missing_fields.join("、")}</p>
                  </div>
                ) : null}
                <p>{source.notes}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className={`rounded-md border px-3 py-1.5 text-sm ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-white text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  )
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium text-foreground">{value}</div>
    </div>
  )
}

function Capability({ label, value }: { label: string; value: boolean }) {
  return (
    <div>
      <div className="text-muted-foreground">{label}</div>
      <div className="font-medium text-foreground">{capabilityText(value)}</div>
    </div>
  )
}
