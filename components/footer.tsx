import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="container flex flex-col gap-3 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>qiu.dev，持续构建有价值的 Web 产品。</p>
        <div className="flex gap-4">
          <Link href="/projects" className="hover:text-foreground">
            项目
          </Link>
          <Link href="/tools" className="hover:text-foreground">
            工具
          </Link>
          <Link href="/contact" className="hover:text-foreground">
            联系我
          </Link>
        </div>
      </div>
    </footer>
  )
}
