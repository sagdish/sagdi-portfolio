import type { Metadata } from "next"
import { setRequestLocale, getTranslations } from "next-intl/server"
import { getPublishedPosts, getAllTags } from "@/lib/notion"
import { BlogFeed } from "@/components/blog/blog-feed"
import { localeAlternates, buildOpenGraph } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "meta" })
  const title = t("blog.title")
  const description = t("blog.description")
  return {
    title,
    description,
    alternates: localeAlternates("/blog", locale),
    openGraph: buildOpenGraph({
      locale,
      path: "/blog",
      title,
      description,
      siteName: t("siteName"),
    }),
    twitter: { card: "summary_large_image", title, description },
  }
}

// Revalidate every 60 seconds (ISR)
export const revalidate = 60

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("blog")
  const posts = await getPublishedPosts()
  const tags = await getAllTags()

  if (posts.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">{t("empty")}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground">{t("intro")}</p>
      </div>

      <BlogFeed posts={posts} tags={tags} />
    </div>
  )
}
