import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { ContactForm } from "@/components/ui/contact-form"
import { Reveal } from "@/components/ui/reveal"
import { pageMetadata } from "@/lib/seo"
import { LINKS } from "@/content/links"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata({ locale, path: "/work", page: "work" })
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
        <h1>{t("title")}</h1>
      </Reveal>

      <Reveal className="prose">
        <p className="dim">{t("prose2")}</p>
        <ContactForm
          labels={{
            name: t("form.name"),
            email: t("form.email"),
            message: t("form.message"),
            send: t("form.send"),
            sending: t("form.sending"),
            sent: t("form.sent"),
            error: t("form.error"),
          }}
        />
      </Reveal>

      <div className="foot-links">
        <span className="c">{t("footerCopyright")}</span>
        <a href={LINKS.github} target="_blank" rel="noopener">
          GitHub
        </a>
        <a href={LINKS.linkedin} target="_blank" rel="noopener">
          LinkedIn
        </a>
        <span className="t">sagdi.com</span>
      </div>
    </>
  )
}
