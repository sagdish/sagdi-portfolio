"use client"

import { useEffect } from "react"
import { usePathname } from "@/i18n/navigation"

/**
 * The app-shell scrolls inside .content (#scroller), not the window — so a client
 * navigation must reset that inner scroller to the top (the browser only restores
 * window scroll). Mirrors the prototype's `scroller.scrollTop = 0` on route change.
 */
export function ScrollReset() {
  const pathname = usePathname()
  useEffect(() => {
    // The nav Subscribe flow scrolls to the banner on arrival — don't fight it.
    try {
      if (sessionStorage.getItem("subscribe-intent")) return
    } catch {}
    // Instant: .content has smooth scrolling on, which would glide every page
    // change up from wherever the last page was left.
    document
      .getElementById("scroller")
      ?.scrollTo({ top: 0, behavior: "instant" })
  }, [pathname])
  return null
}
