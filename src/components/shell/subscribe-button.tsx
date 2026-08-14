"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

/**
 * The quiet "Subscribe" utility pill (rail foot / mobile menu / util-bar).
 * Behavior (per prototype §4c): route to Writing, where the subscribe banner then
 * scroll-into-views, focuses, and plays the one-shot glow. The intent is stashed so
 * the Writing page can consume it on arrival.
 */
export function SubscribeButton({
  className,
  onNavigate,
}: {
  className?: string
  onNavigate?: () => void
}) {
  const router = useRouter()
  const t = useTranslations("shell")

  return (
    <button
      type="button"
      className={cn("railsub", className)}
      onClick={() => {
        onNavigate?.()
        try {
          sessionStorage.setItem("subscribe-intent", "1")
        } catch {}
        router.push("/writing")
      }}
    >
      {t("subscribe")} <span className="arw">→</span>
    </button>
  )
}
