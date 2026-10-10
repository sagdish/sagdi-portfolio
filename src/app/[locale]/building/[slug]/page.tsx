import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { BackLink } from "@/components/ui/back-link"
import { Reveal } from "@/components/ui/reveal"
import { PhotoCarousel } from "@/components/ui/photo-carousel"
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
import { listPhotos } from "@/lib/photos"
import type { Locale } from "@/i18n/routing"

const STATUS_CLASS: Record<ProductStatus, string> = {
  live: "live",
  progress: "progress",
  parked: "parked",
  "pre-start": "",
}

// Every product gets an indexable detail route; an external `url` renders as a
// Visit CTA on the page instead of replacing it. Screenshots are the R2 photo set
// products/<slug> (photo manager); no published set, no strip.
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
      imageAlt: meta("ogImageAlt"),
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

  const L = locale as Locale
  // A missing set falls back to sample frames; those never show on a product.
  const { photos, sample: noShots } = await listPhotos(`products/${slug}`)
  const links = [
    product.url && {
      href: product.url,
      label: `${t("visit")} ${new URL(product.url).host}`,
    },
    product.github && { href: product.github, label: t("github") },
  ].filter((l): l is { href: string; label: string } => Boolean(l))
  const linkRow = (className?: string) =>
    links.length > 0 && (
      <div className={className ? `cta ${className}` : "cta"}>
        {links.map((l, i) => (
          <a
            key={l.href}
            className={`btn ${i === 0 ? "btn-primary" : "btn-secondary"}`}
            href={l.href}
            target="_blank"
            rel="noopener"
          >
            {l.label} <span className="arw">↗</span>
          </a>
        ))}
      </div>
    )
  // Repeat the links at the end only when there is more than a paragraph to read.
  const long = Boolean(product.who || product.how?.length || product.now)

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: product.title,
    description: loc(product.tagline, L),
    url: absoluteUrl(locale, `/building/${slug}`),
    ...(product.url || product.github
      ? { sameAs: product.url ?? product.github }
      : {}),
    inLanguage: locale,
    author: { "@type": "Person", name: "Sagdi Formanov", url: SITE_URL },
  }

  return (
    <>
      <JsonLd data={structuredData} />
      <BackLink href="/building" label={t("back")} />
      <Reveal className="sec-head">
        <div className="eyebrow">{t("eyebrow")}</div>
        <h1>{product.title}</h1>
        <div className="status">
          <span className={`pill ${STATUS_CLASS[product.status]}`.trim()}>
            <span className="d" />
            {statusLabel[product.status]}
          </span>
        </div>
      </Reveal>

      <Reveal className="prose">
        <p>
          {loc(product.tagline, L)}
          {product.placeholder && <span className="sample">sample</span>}
        </p>
        {linkRow()}
      </Reveal>

      {!noShots && (
        <Reveal className="section">
          <PhotoCarousel
            photos={photos}
            label={t("shots.label")}
            labels={{
              prev: t("shots.prev"),
              next: t("shots.next"),
              open: t("shots.open"),
              viewer: {
                title: t("shots.viewer"),
                close: t("shots.close"),
                prev: t("shots.prevShot"),
                next: t("shots.nextShot"),
              },
            }}
          />
        </Reveal>
      )}

      <Reveal className="section prose">
        <h2 className="eyebrow">{t("sections.what")}</h2>
        <div className="section-body">
          <p>{loc(product.body, L)}</p>
        </div>
      </Reveal>
      {product.who && (
        <Reveal className="section prose">
          <h2 className="eyebrow">{t("sections.who")}</h2>
          <div className="section-body">
            <p>{loc(product.who, L)}</p>
          </div>
        </Reveal>
      )}
      {product.how?.length ? (
        <Reveal className="section prose">
          <h2 className="eyebrow">{t("sections.how")}</h2>
          <ul className="section-body">
            {product.how.map((step) => (
              <li key={step.en}>{loc(step, L)}</li>
            ))}
          </ul>
        </Reveal>
      ) : null}
      {product.now && (
        <Reveal className="section prose">
          <h2 className="eyebrow">{t("sections.now")}</h2>
          <div className="section-body">
            <p>{loc(product.now, L)}</p>
          </div>
        </Reveal>
      )}
      {long && linkRow("section")}
    </>
  )
}
