import { Link } from "@/i18n/navigation"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { SubscribeButton } from "./subscribe-button"
import { ThemeControl } from "./theme-control"

/**
 * Mobile/tablet landing utilities (<880px), in-flow at the top of every page — it
 * scrolls away and the floating TopPill takes over. SF logo far-left; language
 * picker + theme + Subscribe grouped right (§I). Hidden ≥880 (the rail owns these).
 */
export function UtilBar() {
  return (
    <div className="util-bar">
      <Link className="tb-home" href="/" aria-label="Home">
        <span className="brand-sq">S</span>
      </Link>
      <div className="util-right">
        <LanguageSwitcher />
        <ThemeControl />
        <SubscribeButton />
      </div>
    </div>
  )
}
