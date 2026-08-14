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
import { localeAlternates } from "@/lib/seo"
import type { Locale } from "@/i18n/routing"

const STATUS_CLASS: Record<ProductStatus, string> = {
  live: "live",
  progress: "progress",
  parked: "parked",
  "pre-start": "",
}

// Only internal products (no external url) get a detail route.
export function generateStaticParams() {
  return PRODUCTS.filter((p) => !p.url).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const product = getProduct(slug)
  if (!product) return { title: "Not found" }
  return {
    title: product.title,
    description: loc(product.tagline, locale as Locale),
    alternates: localeAlternates(`/building/${slug}`, locale),
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
  if (!product || product.url) notFound()

  const t = await getTranslations("building")
  const statusLabel: Record<ProductStatus, string> = {
    live: t("statusLive"),
    progress: t("statusProgress"),
    parked: t("statusParked"),
    "pre-start": t("statusPreStart"),
  }

  return (
    <>
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
          <Link className="btn btn-ghost" href="/building">
            ← {t("back")}
          </Link>
        </div>
      </Reveal>
    </>
  )
}
