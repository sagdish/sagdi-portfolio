"use client"

import { useCallback, useLayoutEffect, useRef, useState } from "react"

export type RevealState = "wait" | "in" | undefined

/**
 * Reveal-on-scroll. Server HTML is fully visible: a block already on screen when
 * it mounts stays as it is. Only a block that starts below the fold is hidden
 * ("wait", before paint) and plays the entrance ("in") when it scrolls into the
 * inner .content scroller (threshold 0.08). Reduced motion: nothing hides.
 * Returns a callback ref plus the `data-reveal` value for the element.
 */
export function useReveal() {
  const elRef = useRef<HTMLElement | null>(null)
  const [state, setState] = useState<RevealState>(undefined)

  const ref = useCallback((el: HTMLElement | null) => {
    elRef.current = el
  }, [])

  useLayoutEffect(() => {
    const el = elRef.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (el.getBoundingClientRect().top < window.innerHeight) return

    setState("wait")
    const root = document.getElementById("scroller")
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState("in")
          io.disconnect()
        }
      },
      { root, threshold: 0.08 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return { ref, state }
}
