import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  // All locales the site supports
  locales: ["en", "ru", "uz"],

  // English is served without a prefix at the root URLs
  defaultLocale: "en",

  // Default locale (en) omits the prefix (/about); others get one (/ru/about)
  localePrefix: "as-needed",

  // Make the URL authoritative: don't redirect unprefixed routes back to a
  // previously-chosen locale via the NEXT_LOCALE cookie / Accept-Language.
  // So `/about` always serves English; language is controlled by the URL/switcher.
  localeDetection: false,
})

export type Locale = (typeof routing.locales)[number]
