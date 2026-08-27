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

// Photography source (Cloudflare R2 public base) — lib/photos.ts fetches
// manifest.json from here; next/image needs the host allowlisted.
const photosBase = process.env.PHOTOS_BASE_URL

const nextConfig: NextConfig = {
  images: photosBase
    ? {
        remotePatterns: [
          {
            protocol: "https",
            hostname: new URL(photosBase).hostname,
            pathname: `${new URL(photosBase).pathname.replace(/\/+$/, "")}/**`,
          },
        ],
      }
    : undefined,
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
