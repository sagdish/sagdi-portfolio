import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Reveal } from "@/components/ui/reveal"
import { pageMetadata } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata({
    locale,
    path: "/work",
    namespace: "work",
    descriptionKey: "prose1",
  })
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("work")

  return (
    <>
      <Reveal className="sec-head">
        <div className="eyebrow">{t("eyebrow")}</div>
        <h2>{t("title")}</h2>
      </Reveal>

      <Reveal className="prose">
        <p>{t("prose1")}</p>
        <p className="dim">
          {t("prose2")} <span className="sample">refine copy</span>
        </p>
        <div className="cta" style={{ marginTop: 22 }}>
          <a
            className="btn btn-primary"
            href="https://linkedin.com/in/sagdi-formanov"
            target="_blank"
            rel="noopener"
          >
            {t("ctaReach")} <span className="arw">→</span>
          </a>
          <a
            className="btn btn-ghost"
            href="https://sagdi.com"
            target="_blank"
            rel="noopener"
          >
            {t("ctaSite")}
          </a>
        </div>
      </Reveal>

      <div className="foot-links">
        <span className="c">{t("footerCopyright")}</span>
        <a href="https://github.com/sagdish" target="_blank" rel="noopener">
          GitHub
        </a>
        <a
          href="https://linkedin.com/in/sagdi-formanov"
          target="_blank"
          rel="noopener"
        >
          LinkedIn
        </a>
        <a href="https://sagdi.com" target="_blank" rel="noopener">
          sagdi.com
        </a>
      </div>
    </>
  )
}
