import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { routing } from "@/i18n/routing"

export const SITE_URL = "https://sagdi.com"

export const OG_IMAGE_ALT = "Sagdi Formanov · building in public"

// Social profiles used for JSON-LD `sameAs` (mirror of footer socialLinks).
export const SOCIAL_LINKS = [
  "https://linkedin.com/in/sagdi-formanov",
  "https://github.com/sagdish",
  "https://instagram.com/forsi_ph",
]

// OpenGraph locale codes per app locale.
export const OG_LOCALE: Record<string, string> = {
  en: "en_US",
  ru: "ru_RU",
  uz: "uz_UZ",
}

// Path (without locale) → path for a given locale, honoring `localePrefix: "as-needed"`
// (default locale stays unprefixed). Returned values are relative and resolve against
// `metadataBase` in the rendered tags.
function pathForLocale(locale: string, path: string): string {
  const clean = path === "/" ? "" : path
  if (locale === routing.defaultLocale) return clean === "" ? "/" : clean
  return `/${locale}${clean}`
}

// Builds `alternates` (canonical + hreflang languages incl. x-default) for a page.
export function localeAlternates(path: string, currentLocale: string) {
  const languages: Record<string, string> = {}
  for (const locale of routing.locales) {
    languages[locale] = pathForLocale(locale, path)
  }
  languages["x-default"] = pathForLocale(routing.defaultLocale, path)
  return {
    canonical: pathForLocale(currentLocale, path),
    languages,
  }
}

// Absolute URL for a path in a given locale (used by sitemap + JSON-LD).
export function absoluteUrl(locale: string, path: string): string {
  const rel = pathForLocale(locale, path)
  return `${SITE_URL}${rel === "/" ? "" : rel}` || SITE_URL
}

// Complete OpenGraph object for a page. Page-level `openGraph` REPLACES the
// parent's (Next doesn't deep-merge), so every page must emit the full set
// (locale, siteName, alternateLocale, image) — this keeps them consistent.
// One-call metadata for a top-level page: localized title/description from `namespace`,
// canonical + hreflang alternates, and the full OpenGraph/Twitter set (page-level
// `openGraph`/`twitter` REPLACE the layout's, so partial objects would lose fields).
export async function pageMetadata(opts: {
  locale: string
  path: string
  namespace: string
  titleKey?: string
  descriptionKey?: string
}): Promise<Metadata> {
  const {
    locale,
    path,
    namespace,
    titleKey = "title",
    descriptionKey = "lede",
  } = opts
  const [t, meta] = await Promise.all([
    getTranslations({ locale, namespace }),
    getTranslations({ locale, namespace: "meta" }),
  ])
  const title = t(titleKey)
  const description = t(descriptionKey)
  return {
    title,
    description,
    alternates: localeAlternates(path, locale),
    openGraph: buildOpenGraph({
      locale,
      path,
      title,
      description,
      siteName: meta("siteName"),
    }),
    twitter: { card: "summary_large_image", title, description },
  }
}

export function buildOpenGraph(opts: {
  locale: string
  path: string
  title: string
  description: string
  siteName: string
  type?: "website" | "article"
}): NonNullable<Metadata["openGraph"]> {
  const { locale, path, title, description, siteName, type = "website" } = opts
  return {
    type,
    siteName,
    title,
    description,
    url: absoluteUrl(locale, path),
    locale: OG_LOCALE[locale],
    alternateLocale: routing.locales
      .filter((l) => l !== locale)
      .map((l) => OG_LOCALE[l]),
    images: [
      {
        url: absoluteUrl(locale, "/opengraph-image"),
        width: 1200,
        height: 630,
        alt: OG_IMAGE_ALT,
      },
    ],
  }
}
