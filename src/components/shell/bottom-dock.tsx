"use client"

import { useTranslations } from "next-intl"
import { Link, usePathname } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import { NAV_ITEMS, isActivePath } from "./nav"

/**
 * Mobile floating glass dock (<880px) — fixed, top-level sibling in .main so no
 * transformed ancestor un-pins it (§4a). Same routes/glyphs as the rail, short labels.
 */
export function BottomDock() {
  const pathname = usePathname()
  const tn = useTranslations("nav")

  return (
    <nav className="dock">
      {NAV_ITEMS.map(({ href, dockKey, icon: Icon }) => (
        <Link
          key={dockKey}
          href={href}
          className={cn(isActivePath(pathname, href) && "active")}
        >
          <span className="ic">
            <Icon size={18} strokeWidth={2} />
          </span>
          {tn(dockKey)}
        </Link>
      ))}
    </nav>
  )
}
