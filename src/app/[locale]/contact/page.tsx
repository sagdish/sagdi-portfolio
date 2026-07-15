import type { Metadata } from "next"
import { setRequestLocale, getTranslations } from "next-intl/server"
import { ContactForm } from "@/components/forms/contact-form"
import { localeAlternates, buildOpenGraph } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "meta" })
  const title = t("contact.title")
  const description = t("contact.description")
  return {
    title,
    description,
    alternates: localeAlternates("/contact", locale),
    openGraph: buildOpenGraph({
      locale,
      path: "/contact",
      title,
      description,
      siteName: t("siteName"),
    }),
    twitter: { card: "summary_large_image", title, description },
  }
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("contact")
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p className="mt-3 text-foreground/80">{t("intro")}</p>
      <ContactForm />
    </div>
  )
}
