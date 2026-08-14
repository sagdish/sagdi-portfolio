import { getTranslations, setRequestLocale } from "next-intl/server"
import { listPosts, listTags } from "@/lib/writing"
import { Reveal } from "@/components/ui/reveal"
import { SubscribeBand } from "@/components/ui/subscribe-band"
import { WritingList } from "@/components/writing/writing-list"

// ISR: pick up new Notion posts without a rebuild (matches the post detail).
export const revalidate = 60

export default async function WritingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("writing")
  const [{ posts, sample }, tags] = await Promise.all([listPosts(), listTags()])

  return (
    <>
      <Reveal className="sec-head">
        <div className="eyebrow">{t("eyebrow")}</div>
        <h2>{t("title")}</h2>
        <p>
          {t("lede")}
          {sample && <span className="sample">{t("sampleNote")}</span>}
        </p>
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
      />

      <Reveal className="elsewhere">
        <a
          className="chip"
          href="https://github.com/sagdish"
          target="_blank"
          rel="noopener"
        >
          {t("elsewhere.github")} ↗
        </a>
        <a
          className="chip"
          href="https://linkedin.com/in/sagdi-formanov"
          target="_blank"
          rel="noopener"
        >
          {t("elsewhere.linkedin")} ↗
        </a>
        <a className="chip" href="https://x.com" target="_blank" rel="noopener">
          {t("elsewhere.x")} ↗ <span className="sample">link</span>
        </a>
      </Reveal>
    </>
  )
}
