"use client"

import type { ReactNode } from "react"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import { useReveal } from "./use-reveal"

type RevealProps = {
  /** when set, renders a link (locale-aware Link, or an external <a> if `external`) */
  href?: string
  /** render an external anchor (new tab) instead of a locale-aware Link */
  external?: boolean
  className?: string
  children?: ReactNode
}

/**
 * Reveal-on-scroll wrapper. The reveal classes go on the element itself (div, Link, or
 * external <a>) so grid items / anchors keep their place — no extra wrapper. `href` is a
 * string (not a component) so a Server Component can use it without passing `Link` across
 * the RSC boundary.
 */
export function Reveal({ href, external, className, children }: RevealProps) {
  const { ref, className: revealClassName } = useReveal()
  const merged = cn(revealClassName, className)

  if (href && external) {
    return (
      <a
        ref={ref}
        href={href}
        target="_blank"
        rel="noopener"
        className={merged}
      >
        {children}
      </a>
    )
  }
  if (href) {
    return (
      <Link ref={ref} href={href} className={merged}>
        {children}
      </Link>
    )
  }
  return (
    <div ref={ref} className={merged}>
      {children}
    </div>
  )
}
