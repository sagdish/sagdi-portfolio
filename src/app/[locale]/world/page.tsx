import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { pageMetadata } from "@/lib/seo"
import { Reveal } from "@/components/ui/reveal"

// The areas of the World, in the order they appear. Non-clickable for now;
// individual chips become links when their destinations exist.
const AREA_KEYS = [
  "music",
  "cinema",
  "cars",
  "books",
  "photography",
  "art",
  "travel",
  "nature",
  "family",
  "martialArts",
] as const

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata({ locale, path: "/world", namespace: "world" })
}

export default async function WorldPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("world")

  return (
    <>
      <Reveal className="sec-head">
        <div className="eyebrow">{t("eyebrow")}</div>
        <h2>{t("title")}</h2>
        <p>{t("lede")}</p>
      </Reveal>

      <Reveal className="elsewhere">
        {AREA_KEYS.map((key) => (
          <span key={key} className="chip">
            {t(`areas.${key}`)}
          </span>
        ))}
      </Reveal>
    </>
  )
}
