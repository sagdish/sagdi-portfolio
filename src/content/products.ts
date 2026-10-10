import type { Locale } from "@/i18n/routing"

export type ProductStatus = "live" | "progress" | "parked" | "pre-start"

/** A localized string. `en` is required; ru/uz fall back to `en` until translated. */
type Localized = Partial<Record<Locale, string>> & { en: string }

export type Product = {
  slug: string
  status: ProductStatus
  /** external product site; the detail page renders it as a Visit CTA */
  url?: string
  title: string
  tagline: Localized
  body: Localized
  /** copy still to be replaced with Sagdi's real words (renders a "sample" marker) */
  placeholder?: boolean
}

// Pulled from the OS product board (PRODUCTS/*/overview.md). Statuses echo the board.
// EN populated; ru/uz fall back to EN until finalized (see loc()).
export const PRODUCTS: Product[] = [
  {
    slug: "reguself",
    status: "live",
    url: "https://reguself.com",
    title: "ReguSelf",
    tagline: { en: "Regulate yourself: a tool for staying on track." },
    body: {
      en: "ReguSelf is live and moving: a tool for regulating your own attention and habits, built in public.",
    },
    placeholder: true,
  },
  {
    slug: "pm-guide",
    status: "live",
    url: "https://pm-guide.vercel.app/",
    title: "The Ultimate Guide to Product Management",
    tagline: {
      en: "A comprehensive, practical resource for aspiring and experienced product managers.",
    },
    body: {
      en: "Covers core PM concepts, frameworks, and real-world applications to help you excel in product management roles.",
    },
  },
  {
    slug: "personal-os",
    status: "pre-start",
    title: "Personal OS",
    tagline: { en: "The reusable blueprint behind the OS." },
    body: {
      en: "The blueprint that makes the personal OS reproducible for anyone, not just me.",
    },
    placeholder: true,
  },
  {
    slug: "pomodoro-focus-dock",
    status: "pre-start",
    title: "Pomodoro Focus Dock",
    tagline: { en: "A focus timer that lives on the dock." },
    body: {
      en: "A small, always-there focus timer that sits on the dock and keeps a session honest.",
    },
    placeholder: true,
  },
  {
    slug: "screenshots-processor",
    status: "progress",
    title: "Screenshots Processor",
    tagline: { en: "Turns a pile of screenshots into something useful." },
    body: {
      en: "Point it at a folder of screenshots and get back something structured and searchable.",
    },
    placeholder: true,
  },
  {
    slug: "finkeep",
    status: "progress",
    title: "finKeep",
    tagline: { en: "A booking tool for psychologists and personal coaches." },
    body: {
      en: "A booking tool for psychologists and personal coaches.",
    },
    placeholder: true,
  },
]

export const getProduct = (slug: string) =>
  PRODUCTS.find((p) => p.slug === slug)

export const loc = (value: Localized, locale: Locale) =>
  value[locale] ?? value.en
