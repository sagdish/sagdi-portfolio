import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

// Old (indexed) URLs → new IA. 301s on prod-swap. Each also covers the ru/uz
// prefixed variants; the default locale (en) is unprefixed.
const REDIRECTS: [string, string][] = [
  ["/projects", "/building"],
  ["/blog", "/writing"],
  ["/blog/:slug", "/writing/:slug"],
  ["/about", "/work"],
  ["/contact", "/work"],
  ["/hub", "/building"],
]

const nextConfig: NextConfig = {
  async redirects() {
    return REDIRECTS.flatMap(([from, to]) => [
      { source: from, destination: to, permanent: true },
      {
        source: `/:locale(ru|uz)${from}`,
        destination: `/:locale${to}`,
        permanent: true,
      },
    ])
  },
}

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

export default withNextIntl(nextConfig)
