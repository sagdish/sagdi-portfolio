import { Link } from "@/i18n/navigation"

// Rendered inside the [locale] layout (keeps the shell). Kept simple/English —
// not-found doesn't receive a resolved request locale for getTranslations.
export default function NotFound() {
  return (
    <div className="sec-head">
      <div className="eyebrow">404</div>
      <h2>This page doesn&apos;t exist.</h2>
      <p>It may have moved, or never did. Head back and keep exploring.</p>
      <div className="cta" style={{ marginTop: 22 }}>
        <Link className="btn btn-primary" href="/">
          Back home <span className="arw">→</span>
        </Link>
      </div>
    </div>
  )
}
