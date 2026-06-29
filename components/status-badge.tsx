import { Badge } from "@/components/ui/badge"
import { Project, statusText } from "@/lib/projects"

export function StatusBadge({ status }: { status: Project["status"] }) {
  return <Badge variant={status}>{statusText[status]}</Badge>
}
