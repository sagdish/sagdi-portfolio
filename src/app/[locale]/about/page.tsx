import type { Metadata } from "next"
import Image from "next/image"
import { setRequestLocale, getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { localeAlternates, buildOpenGraph } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "meta" })
  const title = t("about.title")
  const description = t("about.description")
  return {
    title,
    description,
    alternates: localeAlternates("/about", locale),
    openGraph: buildOpenGraph({
      locale,
      path: "/about",
      title,
      description,
      siteName: t("siteName"),
    }),
    twitter: { card: "summary_large_image", title, description },
  }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations()
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Use grid for desktop, but allow float behavior on mobile */}
      <div className="md:grid md:grid-cols-3 md:gap-8">
        {/* Image container with float for mobile */}
        <div className="md:col-span-1 float-left w-1/2 mr-4 mb-2 md:float-none md:w-full md:mr-0 md:mb-0">
          <div className="relative md:scale-90">
            <Image
              src="/sagdi.jpg"
              alt={t("common.fullName")}
              width={800}
              height={1000}
              sizes="(min-width: 1024px) 30vw, 50vw"
              className="w-full rounded-2xl shadow-lg ring-1 ring-black/5 dark:ring-white/10"
              priority={false}
            />
            <div className="absolute -top-4 left-2 md:-top-6 md:-left-3">
              <div className="rounded-2xl bg-blue-600 text-white dark:bg-blue-500 px-4 py-2 text-sm md:text-base font-semibold shadow-lg">
                {t("about.badge")}
              </div>
            </div>
          </div>
        </div>
        {/* Text container that will wrap around the float */}
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold">{t("about.title")}</h1>
          <p className="mt-3 text-foreground/80">
            {t("about.intro")}
            <br />
            {t("about.collects")}
            <br />
            <em>{t("about.philosophicalLabel")}</em> {t("about.philosophical")}
            <br />
            <em>{t("about.craftLabel")}</em> {t("about.craft")}
            <br />
            <em>{t("about.reflectionLabel")}</em> {t("about.reflection")}
            <br />
            <br />
            {t("about.moreIntro")}{" "}
            <Link href="/blog/more-of-me">
              <u>{t("about.moreLink")}</u>
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
