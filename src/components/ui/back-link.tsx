import type { ComponentProps } from "react"
import { Link } from "@/i18n/navigation"

/**
 * Top-left back button on detail routes (building/[slug], writing/[slug], …).
 * Reuses the .chip primitive verbatim so it matches the site's chips exactly;
 * .backlink only handles placement. Callers pass the target + localized label.
 */
export function BackLink({
  href,
  label,
}: {
  href: ComponentProps<typeof Link>["href"]
  label: string
}) {
  return (
    <Link className="chip backlink" href={href}>
      <span aria-hidden>←</span>
      {label}
    </Link>
  )
}
