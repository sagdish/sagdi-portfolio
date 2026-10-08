import type { Metadata } from "next"
import { Music } from "lucide-react"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { ELSEWHERE, LINKS } from "@/content/links"
import { listPhotos } from "@/lib/photos"
import { listPosts } from "@/lib/writing"
import { pageMetadata } from "@/lib/seo"
import { PhotoCarousel } from "@/components/ui/photo-carousel"
import { Reveal } from "@/components/ui/reveal"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata({ locale, path: "/" })
}

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
  const { photos, sample: photosSample } = await listPhotos("home")

  return (
    <>
      <Reveal className="hero">
        <div className="eyebrow hero-name">{t("name")}</div>
        <h1>{t("titleLine1")}</h1>
        <p className="lede">{t("lede")}</p>
      </Reveal>

      {latest && (
        <Reveal className="section">
          <h2 className="eyebrow">{t("latest.label")}</h2>
          <div className="elsewhere section-body">
            <Link className="chip" href={`/writing/${latest.slug}`}>
              {latest.title} →
              {postsSample && <span className="sample">sample</span>}
            </Link>
          </div>
        </Reveal>
      )}

      <Reveal className="nowcard currently section">
        <div className="cur-head">
          <span className="livedot" />
          <h2 className="lbl">{t("currently.heading")}</h2>
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

      <Reveal className="section">
        <h2 className="eyebrow">
          {t("photography.label")}
          {photosSample && <span className="sample">photos</span>}
        </h2>
        <div className="section-body">
          <PhotoCarousel
            photos={photos}
            label={t("photography.label")}
            labels={{
              prev: t("photography.prev"),
              next: t("photography.next"),
              open: t("photography.open"),
              viewer: {
                title: t("photography.viewer"),
                close: t("photography.close"),
                prev: t("photography.prevPhoto"),
                next: t("photography.nextPhoto"),
              },
            }}
          />
        </div>
      </Reveal>

      <Reveal className="section">
        <h2 className="eyebrow">{t("listening.label")}</h2>
        <div className="elsewhere section-body">
          <a className="chip" href={LINKS.music} target="_blank" rel="noopener">
            <Music size={14} aria-hidden />
            {t("listening.telegram")} ↗
          </a>
        </div>
      </Reveal>

      <Reveal className="section">
        <h2 className="eyebrow">{t("elsewhere.label")}</h2>
        <div className="elsewhere section-body">
          {ELSEWHERE.map((key) => (
            <a
              key={key}
              className="chip"
              href={LINKS[key]}
              target="_blank"
              rel="noopener"
            >
              {t(`elsewhere.${key}`)} ↗
            </a>
          ))}
        </div>
      </Reveal>
    </>
  )
}
