import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { Reveal } from "@/components/ui/reveal"
import {
  PRODUCTS,
  getProduct,
  loc,
  type ProductStatus,
} from "@/content/products"
import {
  SITE_URL,
  absoluteUrl,
  buildOpenGraph,
  localeAlternates,
} from "@/lib/seo"
import { JsonLd } from "@/components/seo/json-ld"
import type { Locale } from "@/i18n/routing"

const STATUS_CLASS: Record<ProductStatus, string> = {
  live: "live",
  progress: "progress",
  parked: "parked",
  "pre-start": "",
}

// Every product gets an indexable detail route; an external `url` renders as a
// Visit CTA on the page instead of replacing it.
export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const product = getProduct(slug)
  if (!product) return { title: "Not found" }
  const meta = await getTranslations({ locale, namespace: "meta" })
  const title = product.title
  const description = loc(product.tagline, locale as Locale)
  const path = `/building/${slug}`
  return {
    title,
    description,
    alternates: localeAlternates(path, locale),
    openGraph: buildOpenGraph({
      locale,
      path,
      title,
      description,
      siteName: meta("siteName"),
    }),
    twitter: { card: "summary_large_image", title, description },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const product = getProduct(slug)
  if (!product) notFound()

  const t = await getTranslations("building")
  const statusLabel: Record<ProductStatus, string> = {
    live: t("statusLive"),
    progress: t("statusProgress"),
    parked: t("statusParked"),
    "pre-start": t("statusPreStart"),
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: product.title,
    description: loc(product.tagline, locale as Locale),
    url: absoluteUrl(locale, `/building/${slug}`),
    ...(product.url ? { sameAs: product.url } : {}),
    inLanguage: locale,
    author: { "@type": "Person", name: "Sagdi Formanov", url: SITE_URL },
  }

  return (
    <>
      <JsonLd data={structuredData} />
      <Reveal className="sec-head">
        <div className="eyebrow">{t("eyebrow")}</div>
        <h2>{product.title}</h2>
        <div style={{ marginTop: 12 }}>
          <span className={`pill ${STATUS_CLASS[product.status]}`.trim()}>
            <span className="d" />
            {statusLabel[product.status]}
          </span>
        </div>
      </Reveal>

      <Reveal className="prose">
        <p>
          {loc(product.tagline, locale as Locale)}
          {product.placeholder && <span className="sample">sample</span>}
        </p>
        <p className="dim">{loc(product.body, locale as Locale)}</p>
        <div className="cta" style={{ marginTop: 22 }}>
          {product.url && (
            <a
              className="btn btn-primary"
              href={product.url}
              target="_blank"
              rel="noopener"
            >
              {t("visit")} {new URL(product.url).host}{" "}
              <span className="arw">↗</span>
            </a>
          )}
          <Link className="btn btn-ghost" href="/building">
            ← {t("back")}
          </Link>
        </div>
      </Reveal>
    </>
  )
}
