import type { MetadataRoute } from "next"
import { getPublishedPosts } from "@/lib/notion"
import { routing } from "@/i18n/routing"
import { SITE_URL, absoluteUrl } from "@/lib/seo"

type StaticRoute = {
  path: string
  changeFrequency: "weekly" | "monthly"
  priority: number
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Fetch all published blog posts
  const posts = await getPublishedPosts()

  const routes: StaticRoute[] = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/about", changeFrequency: "monthly", priority: 0.9 },
    { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
    { path: "/projects", changeFrequency: "weekly", priority: 0.8 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
  ]

  // One entry per page (default-locale URL) carrying hreflang alternates for all locales.
  const staticPages: MetadataRoute.Sitemap = routes.map((route) => {
    const languages: Record<string, string> = {}
    for (const locale of routing.locales) {
      languages[locale] = absoluteUrl(locale, route.path)
    }
    return {
      url: absoluteUrl(routing.defaultLocale, route.path),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: { languages },
    }
  })

  // Shared feed: posts are identical across locales and canonicalize to the
  // unprefixed URL, so each post is listed once.
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishedDate),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  return [...staticPages, ...blogPages]
}
