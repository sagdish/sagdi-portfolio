import { getTranslations, setRequestLocale } from "next-intl/server"
import { Reveal } from "@/components/ui/reveal"

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
      k: t("cards.build.k"),
      title: t("cards.build.title"),
      text: t("cards.build.text"),
      cta: t("cards.build.cta"),
    },
    {
      href: "/writing",
      k: t("cards.think.k"),
      title: t("cards.think.title"),
      text: t("cards.think.text"),
      cta: t("cards.think.cta"),
    },
    {
      href: "/world",
      k: t("cards.world.k"),
      title: t("cards.world.title"),
      text: t("cards.world.text"),
      cta: t("cards.world.cta"),
    },
  ]

  const elsewhere = [
    {
      label: t("elsewhere.linkedin"),
      href: "https://linkedin.com/in/sagdi-formanov",
    },
    { label: t("elsewhere.github"), href: "https://github.com/sagdish" },
    { label: t("elsewhere.instagram"), href: "https://instagram.com/forsi_ph" },
    { label: t("elsewhere.telegram"), href: "https://t.me", pending: true },
    {
      label: t("elsewhere.threads"),
      href: "https://www.threads.net",
      pending: true,
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

      <Reveal className="nowcard currently">
        <div className="cur-head">
          <span className="livedot" />
          <span className="lbl">{t("currently.heading")}</span>
        </div>
        <div className="row">
          <span className="lbl">{t("currently.buildingLabel")}</span>
          <div>
            {t.rich("currently.buildingText", {
              reguself: (chunks) => (
                <a href="https://reguself.com" target="_blank" rel="noopener">
                  {chunks}
                </a>
              ),
            })}{" "}
            <span className="sample">sample</span>
          </div>
        </div>
        <div className="row">
          <span className="lbl">{t("currently.writingLabel")}</span>
          <div>
            {t("currently.writingText")} <span className="sample">sample</span>
          </div>
        </div>
        <div className="row">
          <span className="lbl">{t("currently.exploringLabel")}</span>
          <div>
            {t("currently.exploringText")}{" "}
            <span className="sample">sample</span>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="eyebrow" style={{ marginTop: 44 }}>
          {t("elsewhere.label")}
        </div>
        <div className="elsewhere" style={{ marginTop: 12 }}>
          {elsewhere.map((e) => (
            <a
              key={e.label}
              className="chip"
              href={e.href}
              target="_blank"
              rel="noopener"
            >
              {e.label} ↗{e.pending && <span className="sample">link</span>}
            </a>
          ))}
        </div>
      </Reveal>
    </>
  )
}
