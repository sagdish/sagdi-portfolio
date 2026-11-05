import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"

export default createMiddleware(routing)

export const config = {
  // Skip all paths that should not be internationalized:
  // API routes, Next.js internals, Vercel internals, the iPhone home-screen
  // icon (/apple-icon has no dot, so it needs its own entry), and files with a
  // dot (favicon.ico, sitemap.xml, robots.txt, images, etc.)
  matcher: "/((?!api|_next|_vercel|apple-icon|.*\\..*).*)",
}
