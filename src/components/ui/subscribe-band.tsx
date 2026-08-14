"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react"
import { cn } from "@/lib/utils"
import { useReveal } from "./use-reveal"

/**
 * Subscribe band (visual only at launch). Reveals on scroll; the visual submit swaps
 * the form for a confirmation line. When `armIntent` is set (the Writing instance) and
 * the nav Subscribe flow stashed `subscribe-intent`, on arrival it scrolls itself to
 * center, focuses the field, and plays a one-shot rainbow glow (prototype §4c/§4d).
 *
 * The glow is React state (not a manual classList toggle) so a reveal re-render can't
 * strip it, and a run-once ref guard keeps Strict Mode's double-invoked effect from
 * cancelling the one-shot.
 */
export function SubscribeBand({
  id,
  heading,
  text,
  hint,
  buttonLabel,
  okLabel,
  armIntent = false,
  className,
  style,
}: {
  id?: string
  heading: string
  text: string
  hint: string
  buttonLabel: string
  okLabel: string
  armIntent?: boolean
  className?: string
  style?: CSSProperties
}) {
  const { ref: revealRef, className: revealClassName } = useReveal()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const ranRef = useRef(false)
  const [done, setDone] = useState(false)
  const [glowing, setGlowing] = useState(false)

  const setRoot = useCallback(
    (el: HTMLDivElement | null) => {
      rootRef.current = el
      revealRef(el)
    },
    [revealRef]
  )

  useEffect(() => {
    if (!armIntent || ranRef.current) return
    let hasIntent = false
    try {
      hasIntent = Boolean(sessionStorage.getItem("subscribe-intent"))
    } catch {}
    if (!hasIntent) return

    ranRef.current = true
    try {
      sessionStorage.removeItem("subscribe-intent")
    } catch {}

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    // Scroll after paint so layout is settled.
    requestAnimationFrame(() => {
      rootRef.current?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "center",
      })
    })
    // Focus once the smooth scroll has arrived; preventScroll so it doesn't yank.
    window.setTimeout(
      () => {
        try {
          inputRef.current?.focus({ preventScroll: true })
        } catch {
          inputRef.current?.focus()
        }
      },
      reduce ? 0 : 540
    )
    setGlowing(true)
    window.setTimeout(() => setGlowing(false), 1600)
  }, [armIntent])

  return (
    <div
      ref={setRoot}
      id={id}
      className={cn("sub", revealClassName, glowing && "glow", className)}
      style={style}
    >
      <h3>{heading}</h3>
      <p>{text}</p>
      {done ? (
        <div className="ok">{okLabel}</div>
      ) : (
        <form
          className="subform"
          onSubmit={(e) => {
            e.preventDefault()
            setDone(true)
          }}
        >
          <input
            ref={inputRef}
            type="email"
            placeholder="you@email.com"
            aria-label="Email address"
            required
          />
          <button className="btn btn-primary" type="submit">
            {buttonLabel} <span className="arw">→</span>
          </button>
        </form>
      )}
      <div className="hint">{hint}</div>
    </div>
  )
}
