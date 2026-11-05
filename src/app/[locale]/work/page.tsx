import type { Metadata } from "next"
import Image from "next/image"
import { Briefcase, Handshake } from "lucide-react"
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
        <div className="elsewhere">
          <span className="chip static">
            <Briefcase size={14} aria-hidden />
            {t("options.product")}
          </span>
          <span className="chip static">
            <Handshake size={14} aria-hidden />
            {t("options.collab")}
          </span>
        </div>
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

      <Reveal className="direct">
        <p className="direct-email">
          <a href={`mailto:${LINKS.email}`}>{LINKS.email}</a>
        </p>
        <a className="card" href={LINKS.pspo} target="_blank" rel="noopener">
          <div className="card-head">
            <Image
              className="cert-badge"
              src="/certs/pspo-i.png"
              alt={t("cert.title")}
              width={88}
              height={88}
            />
            <div>
              <h2>{t("cert.title")}</h2>
              <p>{t("cert.issuer")}</p>
            </div>
          </div>
          <div className="foot">
            <span className="pill done">
              <span className="d" />
              {t("cert.status")}
            </span>
            <span className="go" aria-hidden>
              ↗
            </span>
          </div>
        </a>
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
