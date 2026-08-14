import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"

export default function NotFound() {
  const t = useTranslations("notFound")
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-foreground/80">{t("body")}</p>
      <div className="mt-6">
        <Link
          href="/"
          className="text-sm font-medium text-primary hover:underline"
        >
          {t("back")}
        </Link>
      </div>
    </div>
  )
}
