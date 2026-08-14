"use client"

import { useTranslations } from "next-intl"
import { Link, usePathname } from "@/i18n/navigation"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { cn } from "@/lib/utils"
import { NAV_ITEMS, isActivePath } from "./nav"
import { SubscribeButton } from "./subscribe-button"
import { ThemeControl } from "./theme-control"

/**
 * Desktop left rail (≥880px). Brand → nav → foot. Foot row 1 = language picker +
 * a narrowed Subscribe on one line (§I); row 2 = "sagdi.com" + the theme control.
 */
export function SidebarRail() {
  const pathname = usePathname()
  const tn = useTranslations("nav")
  const ts = useTranslations("shell")

  return (
    <aside className="rail">
      <Link className="brand" href="/">
        <span className="brand-sq">S</span>
        <span className="brand-text">
          <span className="brand-name">SAGDI</span>
          <span className="brand-tag">{ts("brandTag")}</span>
        </span>
      </Link>

      <nav className="nav">
        {NAV_ITEMS.map(({ href, key, icon: Icon }) => (
          <Link
            key={key}
            href={href}
            title={tn(key)}
            className={cn(isActivePath(pathname, href) && "active")}
          >
            <span className="ic">
              <Icon size={16} strokeWidth={2} />
            </span>
            <span className="lbl">{tn(key)}</span>
          </Link>
        ))}
      </nav>

      <div className="rail-foot">
        <div className="rail-foot-top">
          <LanguageSwitcher />
          <SubscribeButton />
        </div>
        <div className="rail-foot-row">
          <span className="rail-note">sagdi.com</span>
          <ThemeControl />
        </div>
      </div>
    </aside>
  )
}
