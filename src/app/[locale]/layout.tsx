import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { notFound } from "next/navigation"
import { NextIntlClientProvider, hasLocale } from "next-intl"
import { setRequestLocale, getTranslations } from "next-intl/server"
import "../globals.css"
import { routing } from "@/i18n/routing"
import { SITE_URL, SOCIAL_LINKS, OG_LOCALE, localeAlternates } from "@/lib/seo"
import { JsonLd } from "@/components/seo/json-ld"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Analytics } from "@vercel/analytics/react"
import NextTopLoader from "nextjs-toploader"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "meta" })
  const alternates = localeAlternates("/", locale)

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("default.title"),
      template: `%s | ${t("siteName")}`,
    },
    description: t("default.description"),
    keywords: t("default.keywords"),
    authors: [{ name: "Sagdi Formanov" }],
    alternates,
    icons: {
      icon: "/favicon.ico",
      apple: "/chrome.png",
    },
    openGraph: {
      type: "website",
      siteName: t("siteName"),
      title: t("default.title"),
      description: t("default.description"),
      url: alternates.canonical,
      locale: OG_LOCALE[locale],
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => OG_LOCALE[l]),
    },
    twitter: {
      card: "summary_large_image",
      title: t("default.title"),
      description: t("default.description"),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params

  // Validate the incoming locale
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: "meta" })
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: "Sagdi Formanov",
        alternateName: ["Сагди Форманов"],
        jobTitle: t("jobTitle"),
        url: SITE_URL,
        sameAs: SOCIAL_LINKS,
        knowsLanguage: ["en", "ru", "uz"],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: t("siteName"),
        url: SITE_URL,
        inLanguage: locale,
        publisher: { "@id": `${SITE_URL}/#person` },
      },
    ],
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <JsonLd data={structuredData} />
        <NextTopLoader color="#2563EB" height={2} showSpinner={false} />
        <NextIntlClientProvider>
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
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
