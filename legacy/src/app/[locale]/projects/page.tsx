import type { Metadata } from "next"
import { setRequestLocale, getTranslations } from "next-intl/server"
import { ProjectCard } from "@/components/project/project-card"
import { localeAlternates, buildOpenGraph } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "meta" })
  const title = t("projects.title")
  const description = t("projects.description")
  return {
    title,
    description,
    alternates: localeAlternates("/projects", locale),
    openGraph: buildOpenGraph({
      locale,
      path: "/projects",
      title,
      description,
      siteName: t("siteName"),
    }),
    twitter: { card: "summary_large_image", title, description },
  }
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("projects")
  const items = [
    {
      title: "ReguSelf",
      description: t("pilot.description"),
      href: "https://pilotyourself.com",
      image: "/reguself-frame.png",
      imageAlt: t("pilot.imageAlt"),
    },
    {
      title: "The Ultimate Guide to Product Management",
      description: t("guide.description"),
      href: "https://pm-guide.vercel.app/",
      image: "/pm-guide.png",
      imageAlt: t("guide.imageAlt"),
    },
    {
      title: "Context Collapse",
      description: t("context.description"),
      href: "https://ctx-collapse.vercel.app/",
      image: "/cxt-collapse.png",
      imageAlt: t("context.imageAlt"),
      status: t("context.status"),
    },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">{t("title")}</h1>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {items.map((p) => (
          <ProjectCard
            key={p.title}
            title={p.title}
            description={p.description}
            href={p.href}
            image={p.image}
            imageAlt={p.imageAlt}
            status={p.status}
          />
        ))}
      </div>
    </div>
  )
}
