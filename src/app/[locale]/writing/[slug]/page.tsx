import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"
import rehypeRaw from "rehype-raw"
import { Link } from "@/i18n/navigation"
import { getPost, listPosts } from "@/lib/writing"
import { SITE_URL } from "@/lib/seo"
import { JsonLd } from "@/components/seo/json-ld"

export const revalidate = 60

export async function generateStaticParams() {
  const { posts } = await listPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { post } = await getPost(slug)
  if (!post) return { title: "Post not found" }
  return {
    title: post.title,
    description: post.description || post.title,
    // Posts are language-agnostic → canonicalize to the unprefixed URL.
    alternates: { canonical: `/writing/${slug}` },
  }
}

export default async function WritingPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const t = await getTranslations("writing")
  const { post, sample } = await getPost(slug)
  if (!post) notFound()

  const date = new Date(post.publishedDate)
  const formatted = Number.isNaN(date.getTime())
    ? post.publishedDate
    : date.toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      })

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description || undefined,
    datePublished: post.publishedDate,
    dateModified: post.publishedDate,
    author: { "@type": "Person", name: "Sagdi Formanov", url: SITE_URL },
    keywords: post.tags?.length ? post.tags.join(", ") : undefined,
    inLanguage: locale,
    url: `${SITE_URL}/writing/${slug}`,
    mainEntityOfPage: `${SITE_URL}/writing/${slug}`,
  }

  return (
    <article className="prose article">
      <JsonLd data={structuredData} />
      <div className="eyebrow">{t("eyebrow")}</div>
      <h1 className="article-title">{post.title}</h1>
      <div className="article-meta">
        <span className="date">{formatted}</span>
        {post.tags.map((tag) => (
          <span key={tag} className="tagchip static">
            {tag}
          </span>
        ))}
      </div>
      {sample && (
        <p style={{ marginBottom: 20 }}>
          <span className="sample">{t("sampleNote")}</span>
        </p>
      )}
      <div className="article-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeRaw]}
        >
          {post.content}
        </ReactMarkdown>
      </div>
      <div className="cta" style={{ marginTop: 32 }}>
        <Link className="btn btn-ghost" href="/writing">
          ← {t("back")}
        </Link>
      </div>
    </article>
  )
}
