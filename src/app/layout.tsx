import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Analytics } from "@vercel/analytics/react"
import NextTopLoader from "nextjs-toploader"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://sagdi.com"),
  title: "Sagdi Formanov - Product Manager | Bay Area",
  description:
    "Experienced Product Manager specializing in cross-functional team leadership and product strategy in the travel tech industry.",
  keywords:
    "product manager, Bay Area, cross-functional teams, product strategy, travel tech",
  authors: [{ name: "Sagdi Formanov" }],
  icons: {
    icon: "/favicon.ico",
    apple: "/chrome.png",
  },
  openGraph: {
    title: "Sagdi Formanov - Product Manager | Bay Area",
    description:
      "Experienced Product Manager specializing in cross-functional team leadership and product strategy in the travel tech industry.",
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <NextTopLoader color="#2563EB" height={2} showSpinner={false} />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
