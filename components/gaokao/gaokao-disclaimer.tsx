import { AlertTriangle } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

export function GaokaoDisclaimer() {
  return (
    <Card className="border-blue-100 bg-blue-50/70 shadow-none">
      <CardContent className="flex gap-3 p-4 text-sm leading-6 text-blue-900">
        <AlertTriangle
          className="mt-0.5 h-5 w-5 shrink-0 text-blue-700"
          aria-hidden="true"
        />
        <p>
          当前系统正在接入真实招生数据。已接入数据会标注来源；未接入地区可能使用演示数据。
          志愿填报属于重大决策，请务必结合省教育考试院、阳光高考、高校招生章程等官方信息核验。
        </p>
      </CardContent>
    </Card>
  )
}
