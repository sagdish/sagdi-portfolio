import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { matrixType } from "@/app/fonts/matrix-type"

// Rendered inside the [locale] layout (keeps the shell); next-intl reads the
// locale from the request, so the copy follows the URL's language.
export default function NotFound() {
  const t = useTranslations("notFound")
  return (
    <div className="sec-head">
      <div className={`nf-code ${matrixType.className}`}>404</div>
      <h1 className={`nf-road ${matrixType.className}`}>{t("title")}</h1>
      <p className="nf-sub">{t("text")}</p>
      <div className="cta">
        <Link className="btn btn-primary" href="/">
          {t("home")} <span className="arw">→</span>
        </Link>
      </div>
    </div>
  )
}
