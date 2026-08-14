import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"

export default createMiddleware(routing)

export const config = {
  // Skip all paths that should not be internationalized:
  // API routes, Next.js internals, Vercel internals, and files with a dot
  // (favicon.ico, sitemap.xml, robots.txt, images, etc.)
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
}
