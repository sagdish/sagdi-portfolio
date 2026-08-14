"use client"

import { useEffect, useRef, useState } from "react"
import { EllipsisVertical } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { cn } from "@/lib/utils"
import { SubscribeButton } from "./subscribe-button"
import { ThemeControl } from "./theme-control"

/**
 * Mobile floating top pill (<880px). Hidden at the top of a page (the in-flow
 * UtilBar carries identity + utilities there); once the hero name scrolls past
 * (scrollTop > 120) it slides in to take over. The kebab unfolds a utilities menu
 * ON TOP of the content: Theme · Language · Subscribe. Fixed, top-level sibling in
 * .main (no transformed ancestor — §4a).
 */
export function TopPill() {
  const t = useTranslations("shell")
  const [show, setShow] = useState(false)
  const [open, setOpen] = useState(false)
  const moreRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scroller = document.getElementById("scroller")
    if (!scroller) return
    const onScroll = () => {
      const next = scroller.scrollTop > 120
      setShow(next)
      if (!next) setOpen(false)
    }
    scroller.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => scroller.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        menuRef.current?.contains(target) ||
        moreRef.current?.contains(target)
      )
        return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("click", onClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("click", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <header className={cn("topbar", show && "show")}>
      <Link className="tb-home" href="/" aria-label="Home">
        <span className="brand-sq">S</span>
      </Link>
      <span className="tb-name">SAGDI</span>
      <button
        ref={moreRef}
        type="button"
        className="tb-more"
        aria-label={t("menu")}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((o) => !o)
        }}
      >
        <EllipsisVertical size={18} />
      </button>

      <div ref={menuRef} className={cn("tb-menu", open && "open")}>
        <div className="tb-menu-row">
          <span className="tb-menu-label">{t("theme")}</span>
          <ThemeControl />
        </div>
        <div className="tb-menu-row">
          <span className="tb-menu-label">{t("language")}</span>
          <LanguageSwitcher />
        </div>
        <SubscribeButton onNavigate={() => setOpen(false)} />
      </div>
    </header>
  )
}
