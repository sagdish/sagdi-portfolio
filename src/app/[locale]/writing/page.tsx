import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { listPosts, listTags } from "@/lib/writing"
import { pageMetadata } from "@/lib/seo"
import { Reveal } from "@/components/ui/reveal"
import { SubscribeBand } from "@/components/ui/subscribe-band"
import { WritingList } from "@/components/writing/writing-list"
import { LINKS } from "@/content/links"

// ISR: pick up new Notion posts without a rebuild (matches the post detail).
export const revalidate = 60

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

  return (
    <>
      <Reveal className="sec-head">
        <div className="eyebrow">{t("eyebrow")}</div>
        <h1>{t("title")}</h1>
        <p>{t("lede")}</p>
      </Reveal>

      <WritingList
        posts={posts}
        tags={tags}
        locale={locale}
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
