import type { MetadataRoute } from "next"
import { routing } from "@/i18n/routing"
import { SITE_URL, absoluteUrl } from "@/lib/seo"
import { PRODUCTS } from "@/content/products"
import { listPosts } from "@/lib/writing"

type Route = {
  path: string
  changeFrequency: "weekly" | "monthly"
  priority: number
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const routes: Route[] = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/building", changeFrequency: "weekly", priority: 0.9 },
    { path: "/writing", changeFrequency: "weekly", priority: 0.8 },
    { path: "/work", changeFrequency: "monthly", priority: 0.7 },
    ...PRODUCTS.filter((p) => !p.url).map((p) => ({
      path: `/building/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
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

  // Posts are language-agnostic → each listed once at its unprefixed URL.
  const { posts } = await listPosts()
  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/writing/${post.slug}`,
    lastModified: new Date(post.publishedDate),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  return [...staticPages, ...postPages]
}
