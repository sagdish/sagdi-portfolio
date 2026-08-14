"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Reveal-on-scroll — mirrors the prototype's IntersectionObserver (root = the inner
 * .content scroller, threshold 0.08). Elements already on screen at mount reveal
 * immediately; reduced-motion reveals with no transition. Returns a callback ref so
 * it can attach to any element (div or Link) without element-type casts.
 */
export function useReveal() {
  const elRef = useRef<HTMLElement | null>(null)
  const [shown, setShown] = useState(false)

  const ref = useCallback((el: HTMLElement | null) => {
    elRef.current = el
  }, [])

  useEffect(() => {
    const el = elRef.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true)
      return
    }
    const root = document.getElementById("scroller")
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true)
            io.disconnect()
          }
        }),
      { root: root ?? null, threshold: 0.08 }
    )
    io.observe(el)
    if (el.getBoundingClientRect().top < window.innerHeight * 0.95)
      setShown(true)
    return () => io.disconnect()
  }, [])

  return { ref, className: shown ? "reveal in" : "reveal" }
}
