import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { pageMetadata } from "@/lib/seo"
import { Reveal } from "@/components/ui/reveal"
import { PRODUCTS, loc, type ProductStatus } from "@/content/products"
import type { Locale } from "@/i18n/routing"

const STATUS_CLASS: Record<ProductStatus, string> = {
  live: "live",
  progress: "progress",
  parked: "parked",
  "pre-start": "",
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata({ locale, path: "/building", namespace: "building" })
}

export default async function BuildingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
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
        <h2>{t("title")}</h2>
        <p>{t("lede")}</p>
      </Reveal>

      <div className="grid">
        {PRODUCTS.map((p) => (
          <Reveal key={p.slug} href={`/building/${p.slug}`} className="card">
            <h3>{p.title}</h3>
            <p>
              {loc(p.tagline, locale as Locale)}
              {p.placeholder && <span className="sample">sample</span>}
            </p>
            <div className="foot">
              <span className={`pill ${STATUS_CLASS[p.status]}`.trim()}>
                <span className="d" />
                {statusLabel[p.status]}
              </span>
              <span className="go">{t("readMore")} →</span>
            </div>
          </Reveal>
        ))}
      </div>
    </>
  )
}
