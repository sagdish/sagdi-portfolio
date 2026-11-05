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

// Basic security headers on every response. No Content-Security-Policy yet: it
// needs care so it doesn't block Next's own scripts, Vercel Analytics or fonts.
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }]
  },
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
