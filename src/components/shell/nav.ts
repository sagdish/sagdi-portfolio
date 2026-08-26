import {
  Briefcase,
  Globe,
  House,
  Package,
  PenLine,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  href: string
  /** message key under the `nav` namespace (full label, used by the rail) */
  key: string
  /** message key for the short dock label */
  dockKey: string
  icon: LucideIcon
}

/**
 * Single source for the five routes + their lucide glyphs (same shapes as the OS:
 * house / package / pen-line / globe / briefcase). Consumed by the rail and the dock.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", key: "home", dockKey: "home", icon: House },
  { href: "/building", key: "building", dockKey: "building", icon: Package },
  { href: "/writing", key: "writing", dockKey: "writing", icon: PenLine },
  { href: "/world", key: "world", dockKey: "world", icon: Globe },
  { href: "/work", key: "work", dockKey: "workShort", icon: Briefcase },
]

export function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}
