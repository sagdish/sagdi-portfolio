import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { listPosts, listTags } from "@/lib/writing"
import { pageMetadata } from "@/lib/seo"
import { Reveal } from "@/components/ui/reveal"
import { SubscribeBand } from "@/components/ui/subscribe-band"
import { WritingList, type MonthYear } from "@/components/writing/writing-list"
import { LINKS } from "@/content/links"

// ISR: pick up new Notion posts without a rebuild (matches the post detail).
export const revalidate = 60

/**
 * Month and year as two lines ("Oct" over "2026"), first letter capitalized
 * ("окт." → "Окт."). Formatted here on the server, never in the browser: Chrome
 * has no Uzbek month names and would show "M10".
 */
function monthYear(iso: string, locale: string): MonthYear {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { month: iso, year: "" }
  const month = d.toLocaleDateString(locale, {
    month: "short",
    timeZone: "UTC",
  })
  return {
    month: month.charAt(0).toLocaleUpperCase(locale) + month.slice(1),
    year: String(d.getUTCFullYear()),
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata({ locale, path: "/writing", page: "writing" })
}

export default async function WritingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("writing")
  const [posts, tags] = await Promise.all([listPosts(), listTags()])
  const dates = Object.fromEntries(
    posts.map((p) => [p.id, monthYear(p.publishedDate, locale)])
  )

  return (
    <>
      <Reveal className="sec-head">
        <div className="eyebrow">{t("eyebrow")}</div>
        <h1>{t("title")}</h1>
        <p>{t("lede")}</p>
      </Reveal>

      <WritingList
        posts={posts}
        dates={dates}
        tags={tags}
        allLabel={t("all")}
      />

      <SubscribeBand
        id="subscribe"
        armIntent
        heading={t("subscribe.heading")}
        text={t("subscribe.text")}
        hint={t("subscribe.hint")}
        buttonLabel={t("subscribe.button")}
        okLabel={t("subscribe.ok")}
        emailLabel={t("subscribe.emailLabel")}
      />

      <Reveal className="elsewhere">
        <a className="chip" href={LINKS.github} target="_blank" rel="noopener">
          {t("elsewhere.github")} ↗
        </a>
        <a
          className="chip"
          href={LINKS.linkedin}
          target="_blank"
          rel="noopener"
        >
          {t("elsewhere.linkedin")} ↗
        </a>
      </Reveal>
    </>
  )
}
