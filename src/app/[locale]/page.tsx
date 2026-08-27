import { getTranslations, setRequestLocale } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { listPosts } from "@/lib/writing"
import { Reveal } from "@/components/ui/reveal"

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("home")
  const { posts, sample: postsSample } = await listPosts()
  const latest = posts[0]

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

      {latest && (
        <Reveal>
          <div className="eyebrow">{t("latest.label")}</div>
          <div className="elsewhere" style={{ marginTop: 12 }}>
            <Link className="chip" href={`/writing/${latest.slug}`}>
              {latest.title} →
              {postsSample && <span className="sample">sample</span>}
            </Link>
          </div>
        </Reveal>
      )}

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
          {t("photography.label")} <span className="sample">photos</span>
        </div>
        <div className="photostrip" style={{ marginTop: 12 }}>
          <div className="photoslot" />
          <div className="photoslot" />
          <div className="photoslot" />
        </div>
      </Reveal>

      <Reveal>
        <div className="eyebrow" style={{ marginTop: 44 }}>
          {t("listening.label")}
        </div>
        <div className="elsewhere" style={{ marginTop: 12 }}>
          <a
            className="chip"
            href="https://t.me"
            target="_blank"
            rel="noopener"
          >
            {t("listening.telegram")} ↗<span className="sample">link</span>
          </a>
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
