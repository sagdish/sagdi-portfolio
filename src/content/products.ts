import type { Locale } from "@/i18n/routing"

export type ProductStatus = "live" | "progress" | "parked" | "pre-start"

/** A localized string. `en` is required; ru/uz fall back to `en` until translated. */
type Localized = Partial<Record<Locale, string>> & { en: string }

export type Product = {
  slug: string
  status: ProductStatus
  /** external URL (opens in a new tab) instead of an internal detail route */
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
    slug: "sagdi-os",
    status: "progress",
    title: "Sagdi OS",
    tagline: {
      en: "A personal life OS: five areas, one ledger, one live session.",
    },
    body: {
      en: "The system running my days: five life areas, a single ledger, and one live working session. The thing this hub is built inside of.",
    },
    placeholder: true,
  },
  {
    slug: "os-manager-blueprint",
    status: "pre-start",
    title: "OS Manager Blueprint",
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
    status: "pre-start",
    title: "Screenshots Processor",
    tagline: { en: "Turns a pile of screenshots into something useful." },
    body: {
      en: "Point it at a folder of screenshots and get back something structured and searchable.",
    },
    placeholder: true,
  },
  {
    slug: "ai-job-agent",
    status: "parked",
    title: "AI Job Agent",
    tagline: { en: "An agent that works the job hunt." },
    body: {
      en: "An agent that runs the repetitive parts of a job search. Parked for now.",
    },
    placeholder: true,
  },
]

export const getProduct = (slug: string) =>
  PRODUCTS.find((p) => p.slug === slug)

export const loc = (value: Localized, locale: Locale) =>
  value[locale] ?? value.en
