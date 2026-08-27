import { Link } from "@/i18n/navigation"
import { matrixType } from "@/app/fonts/matrix-type"

// Rendered inside the [locale] layout (keeps the shell). Kept simple/English —
// not-found doesn't receive a resolved request locale for getTranslations.
export default function NotFound() {
  return (
    <div className="sec-head">
      <div className={`nf-code ${matrixType.className}`}>404</div>
      <h2 className={`nf-road ${matrixType.className}`}>ROAD CLOSED HERE</h2>
      <p className="nf-sub">This page took an exit that doesn&apos;t exist.</p>
      <div className="cta" style={{ marginTop: 26 }}>
        <Link className="btn btn-primary" href="/">
          Take me home <span className="arw">→</span>
        </Link>
      </div>
    </div>
  )
}
