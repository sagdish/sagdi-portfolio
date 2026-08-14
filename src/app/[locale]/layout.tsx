import type { Metadata } from "next"
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google"
import { notFound } from "next/navigation"
import { NextIntlClientProvider, hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Analytics } from "@vercel/analytics/react"
import NextTopLoader from "nextjs-toploader"

import "../globals.css"
import "../design.css"
import { routing } from "@/i18n/routing"
import { SITE_URL, SOCIAL_LINKS, OG_LOCALE, localeAlternates } from "@/lib/seo"
import { JsonLd } from "@/components/seo/json-ld"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { SidebarRail } from "@/components/shell/sidebar-rail"
import { BottomDock } from "@/components/shell/bottom-dock"
import { TopPill } from "@/components/shell/top-pill"
import { UtilBar } from "@/components/shell/util-bar"
import { ScrollReset } from "@/components/shell/scroll-reset"

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
})
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
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
    icons: { icon: "/favicon.ico", apple: "/chrome.png" },
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
  if (!hasLocale(routing.locales, locale)) notFound()
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
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${hanken.variable} ${jetbrains.variable}`}
    >
      <body className="font-sans antialiased">
        <JsonLd data={structuredData} />
        <NextTopLoader color="#4686eb" height={2} showSpinner={false} />

        {/* Refraction filter for the glass dock / top-pill — inlined once. */}
        <svg
          width="0"
          height="0"
          aria-hidden="true"
          style={{ position: "absolute" }}
        >
          <filter
            id="liquid-glass"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.010 0.013"
              numOctaves={2}
              seed={42}
              result="noise"
            />
            <feGaussianBlur in="noise" stdDeviation="1.2" result="soft" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="soft"
              scale={12}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </svg>

        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="app">
              <SidebarRail />
              <div className="main">
                <TopPill />
                <div className="content" id="scroller">
                  <div className="wrap">
                    <UtilBar />
                    {children}
                  </div>
                </div>
                <BottomDock />
              </div>
            </div>
            <ScrollReset />
          </ThemeProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
