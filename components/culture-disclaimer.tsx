import { cultureDisclaimer } from "@/lib/traditional-culture"

export function CultureDisclaimer() {
  return (
    <p className="rounded-md border border-border bg-white p-4 text-sm leading-6 text-muted-foreground">
      {cultureDisclaimer}
    </p>
  )
}
