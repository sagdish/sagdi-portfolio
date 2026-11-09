import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { BrandMark } from "./brand-mark"
import { SubscribeButton } from "./subscribe-button"
import { ThemeControl } from "./theme-control"

/**
 * Mobile/tablet landing utilities (<880px), in-flow at the top of every page — it
 * scrolls away and the floating TopPill takes over. SF logo far-left; language
 * picker + theme + Subscribe grouped right (§I). Hidden ≥880 (the rail owns these).
 */
export function UtilBar() {
  const tn = useTranslations("nav")
  return (
    <div className="util-bar">
      <Link className="tb-home" href="/" aria-label={tn("home")}>
        <BrandMark />
      </Link>
      <div className="util-right">
        {/* opens rightward: the button sits left in this bar, so a menu aligned to
            its right edge would run off the left side of a phone screen */}
        <LanguageSwitcher alignLeft />
        <ThemeControl />
        <SubscribeButton />
      </div>
    </div>
  )
}
