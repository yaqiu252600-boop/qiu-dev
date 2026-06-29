import type { Metadata } from "next"
import { Inter } from "next/font/google"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://qiu.dev"),
  title: "qiu.dev | 持续构建有价值的 Web 产品",
  description: "持续构建 Web 工具、AI 应用和实验性项目。",
  icons: {
    icon: "/icon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
