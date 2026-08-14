import { getTranslations, setRequestLocale } from "next-intl/server"
import { Reveal } from "@/components/ui/reveal"
import { PRODUCTS, loc, type ProductStatus } from "@/content/products"
import type { Locale } from "@/i18n/routing"

const STATUS_CLASS: Record<ProductStatus, string> = {
  live: "live",
  progress: "progress",
  parked: "parked",
  "pre-start": "",
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
        {PRODUCTS.map((p) => {
          const external = Boolean(p.url)
          return (
            <Reveal
              key={p.slug}
              href={external ? (p.url as string) : `/building/${p.slug}`}
              external={external}
              className="card"
            >
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
                <span className="go">
                  {external
                    ? `${new URL(p.url as string).host} ↗`
                    : `${t("readMore")} →`}
                </span>
              </div>
            </Reveal>
          )
        })}
      </div>
    </>
  )
}
