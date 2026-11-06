import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { ELSEWHERE, LINKS } from "@/content/links"
import { listPhotos } from "@/lib/photos"
import { listPosts } from "@/lib/writing"
import { pageMetadata } from "@/lib/seo"
import { CurrentlyCard } from "@/components/ui/currently-card"
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
  const posts = await listPosts()
  const latest = posts[0]
  const { photos, sample: photosSample } = await listPhotos("home")

  return (
    <>
      <Reveal className="hero">
        <div className="eyebrow hero-name">{t("name")}</div>
        <h1>{t("titleLine1")}</h1>
        <p className="lede">{t("intro")}</p>
      </Reveal>

      {latest && (
        <Reveal className="section">
          <h2 className="eyebrow">{t("latest.label")}</h2>
          <div className="elsewhere section-body">
            <Link className="chip" href={`/writing/${latest.slug}`}>
              {latest.title} →
            </Link>
          </div>
        </Reveal>
      )}

      <Reveal className="nowcard currently section">
        <CurrentlyCard
          heading={t("currently.heading")}
          moreLabel={t("currently.more")}
          allLabel={t("currently.all")}
          items={[
            t.rich("currently.reguself", {
              reguself: (chunks) => (
                <a href="https://reguself.com" target="_blank" rel="noopener">
                  {chunks}
                </a>
              ),
            }),
            t("currently.personalOs"),
            t("currently.ytSkill"),
          ]}
        />
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
        <p className="lede">{t("lede")}</p>
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
