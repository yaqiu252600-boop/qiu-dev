import Link from "next/link"
import { CalendarDays, Compass, ScrollText, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"

const links = [
  { title: "每日一签", href: "/tools/daily-fortune", icon: ScrollText },
  { title: "八字排盘", href: "/tools/bazi", icon: Compass },
  { title: "取名推荐", href: "/tools/name", icon: Sparkles },
  { title: "良辰吉日", href: "/tools/auspicious-date", icon: CalendarDays },
]

export function CultureToolLinks() {
  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      {links.map((link) => {
        const Icon = link.icon
        return (
          <Button key={link.href} asChild variant="outline" size="sm">
            <Link href={link.href}>
              <Icon aria-hidden="true" />
              {link.title}
            </Link>
          </Button>
        )
      })}
    </div>
  )
}
