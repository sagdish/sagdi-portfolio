"use client"

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import { Check, ChevronDown } from "lucide-react"

import { usePathname, useRouter } from "@/i18n/navigation"
import type { Locale } from "@/i18n/routing"
import { cn } from "@/lib/utils"

// Order per design: English, Uzbek, Russian. Names are autonyms so each
// speaker recognizes their own language.
const LANGUAGES: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "uz", label: "Oʻzbek" },
  { code: "ru", label: "Русский" },
]

// Small rounded flag icons drawn inline (no image assets needed).
function Flag({ code, className }: { code: Locale; className?: string }) {
  const wrap = cn(
    "inline-block h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px]",
    className
  )
  if (code === "ru") {
    return (
      <span className={wrap} aria-hidden="true">
        <svg viewBox="0 0 20 15" className="h-full w-full">
          <rect width="20" height="15" fill="#fff" />
          <rect y="5" width="20" height="5" fill="#0039A6" />
          <rect y="10" width="20" height="5" fill="#D52B1E" />
          {/* gray stroke only around the top white stripe so it stays visible on light bg */}
          <rect
            x="0.35"
            y="0.35"
            width="19.3"
            height="4.65"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="0.7"
          />
        </svg>
      </span>
    )
  }
  if (code === "uz") {
    return (
      <span className={wrap} aria-hidden="true">
        <svg viewBox="0 0 20 15" className="h-full w-full">
          <rect width="20" height="15" fill="#0099B5" />
          <rect y="5.5" width="20" height="4" fill="#fff" />
          <rect y="10.5" width="20" height="4.5" fill="#1EB53A" />
          <rect y="5" width="20" height="0.5" fill="#CE1126" />
          <rect y="10" width="20" height="0.5" fill="#CE1126" />
          {/* crescent */}
          <circle cx="3.6" cy="2.8" r="1.7" fill="#fff" />
          <circle cx="4.3" cy="2.8" r="1.4" fill="#0099B5" />
          <circle cx="6.1" cy="1.9" r="0.4" fill="#fff" />
          <circle cx="6.1" cy="3.1" r="0.4" fill="#fff" />
        </svg>
      </span>
    )
  }
  // en → US flag (simplified stripes + canton)
  return (
    <span className={wrap} aria-hidden="true">
      <svg viewBox="0 0 20 15" className="h-full w-full">
        <rect width="20" height="15" fill="#fff" />
        {[0, 2, 4, 6, 8, 10, 12].map((i) => (
          <rect
            key={i}
            y={(i * 15) / 13}
            width="20"
            height={15 / 13}
            fill="#B22234"
          />
        ))}
        <rect width="9" height={(15 * 7) / 13} fill="#3C3B6E" />
        {[1.6, 4.4, 7.2].map((x) =>
          [1.4, 4, 6.6].map((y) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="0.5" fill="#fff" />
          ))
        )}
      </svg>
    </span>
  )
}

export function LanguageSwitcher({
  openUp = false,
  alignLeft = false,
}: {
  /** open the menu above the trigger (rail foot sits at the viewport bottom) */
  openUp?: boolean
  /** align the menu's left edge to the trigger (keeps it inside the narrow rail) */
  alignLeft?: boolean
} = {}) {
  const t = useTranslations("nav")
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [pending, startTransition] = React.useTransition()
  const rootRef = React.useRef<HTMLDivElement>(null)
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const menuId = React.useId()

  // Close on outside click / Escape (Escape hands focus back to the trigger).
  React.useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      setOpen(false)
      buttonRef.current?.focus()
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onEsc)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onEsc)
    }
  }, [open])

  const switchTo = (code: Locale) => {
    setOpen(false)
    if (code === locale) return
    startTransition(() => {
      router.replace(pathname, { locale: code })
    })
  }

  return (
    <div ref={rootRef} className="lang">
      <button
        ref={buttonRef}
        type="button"
        className="lang-btn"
        aria-label={t("changeLanguage")}
        aria-expanded={open}
        aria-controls={menuId}
        disabled={pending}
        onClick={() => setOpen((v) => !v)}
      >
        <Flag code={locale} />
        <ChevronDown className="lang-chev" size={14} aria-hidden />
      </button>

      {open && (
        <div
          id={menuId}
          className={cn("lang-menu", alignLeft && "start", openUp && "up")}
        >
          {LANGUAGES.map(({ code, label }) => {
            const active = code === locale
            return (
              <button
                key={code}
                type="button"
                lang={code}
                className="lang-item"
                aria-current={active ? "true" : undefined}
                onClick={() => switchTo(code)}
              >
                {/* checkmark on the LEFT, reserved space keeps rows aligned */}
                <Check className="lang-check" size={16} aria-hidden />
                <Flag code={code} />
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
