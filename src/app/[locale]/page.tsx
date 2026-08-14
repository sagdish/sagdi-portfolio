import { getTranslations, setRequestLocale } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { Reveal } from "@/components/ui/reveal"
import { SubscribeBand } from "@/components/ui/subscribe-band"

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("home")

  const cards = [
    {
      href: "/building",
      k: t("cards.building.k"),
      title: t("cards.building.title"),
      text: t("cards.building.text"),
      cta: t("cards.building.cta"),
    },
    {
      href: "/writing",
      k: t("cards.writing.k"),
      title: t("cards.writing.title"),
      text: t("cards.writing.text"),
      cta: t("cards.writing.cta"),
    },
    {
      href: "/work",
      k: t("cards.work.k"),
      title: t("cards.work.title"),
      text: t("cards.work.text"),
      cta: t("cards.work.cta"),
    },
  ]

  return (
    <>
      <Reveal className="hero">
        <div className="eyebrow hero-name">{t("name")}</div>
        <h1>
          {t("titleLine1")}
          <br />
          {t("titleLine2")}
        </h1>
        <p className="lede">{t("lede")}</p>
        <div className="cta">
          <Link className="btn btn-primary" href="/building">
            {t("ctaPrimary")} <span className="arw">→</span>
          </Link>
          <Link className="btn btn-ghost" href="/writing">
            {t("ctaSecondary")}
          </Link>
        </div>
        <div className="nowcard">
          <span className="livedot" />
          <div>
            <div className="lbl">{t("nowLabel")}</div>
            <div>
              {t.rich("nowText", {
                reguself: (chunks) => (
                  <a href="https://reguself.com" target="_blank" rel="noopener">
                    {chunks}
                  </a>
                ),
              })}{" "}
              <span className="sample">sample</span>
            </div>
          </div>
        </div>
      </Reveal>

      <div style={{ height: 44 }} />

      <div className="cta-grid">
        {cards.map((c) => (
          <Reveal key={c.href} href={c.href} className="cta-card">
            <div className="k">{c.k}</div>
            <h3>{c.title}</h3>
            <p>{c.text}</p>
            <span className="arw">{c.cta} →</span>
          </Reveal>
        ))}
      </div>

      <SubscribeBand
        style={{ marginTop: 44 }}
        heading={t("subscribe.heading")}
        text={t("subscribe.text")}
        hint={t("subscribe.hint")}
        buttonLabel={t("subscribe.button")}
        okLabel={t("subscribe.ok")}
      />
    </>
  )
}
