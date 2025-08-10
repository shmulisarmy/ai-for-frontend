import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Kanban Board",
  description: "A Kanban board powered by backend-driven state synchronization",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <nav className="p-4 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex gap-4">
          <Link href="/" className="text-purple-600 hover:underline font-semibold text-lg">
            Kanban Board
          </Link>
          {/* Removed Todos link as per focus shift */}
        </nav>
        {children}
      </body>
    </html>
  )
}
