import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import "./globals.css"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Buyer Lead CRM - Real Estate Lead Management",
  description:
    "Professional CRM for managing real estate buyer leads with advanced filtering, CSV import/export, and comprehensive tracking.",
  generator: "v0.app",
  keywords: ["CRM", "real estate", "leads", "buyer management", "property"],
  authors: [{ name: "Buyer Lead CRM" }],
  viewport: "width=device-width, initial-scale=1",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ErrorBoundary>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
