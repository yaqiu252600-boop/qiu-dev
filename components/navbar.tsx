import Link from "next/link"
import { Code2 } from "lucide-react"

import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/", label: "首页" },
  { href: "/projects", label: "项目" },
  { href: "/products", label: "产品" },
  { href: "/tools", label: "工具" },
  { href: "/about", label: "关于" },
  { href: "/contact", label: "联系" },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Code2 className="h-4 w-4" aria-hidden="true" />
          </span>
          <span>qiu.dev</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Button key={item.href} asChild variant="ghost" size="sm">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
        <Button asChild size="sm" className="hidden md:inline-flex">
          <Link href="/tools/pdf-to-word">打开工具</Link>
        </Button>
        <nav className="flex items-center gap-1 md:hidden">
          <Button asChild variant="ghost" size="sm">
            <Link href="/projects">项目</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/tools">工具</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
