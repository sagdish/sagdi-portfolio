"use client"

import { useEffect, useState } from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

/**
 * Exact replica of the OS 3-state theme control (Light / Auto / Dark) — a bordered
 * field of icon buttons, active = bg-accent. Wired to next-themes setTheme; the
 * chosen MODE is highlighted (including "system"), matching the prototype.
 */
export function ThemeControl() {
  const { theme, setTheme } = useTheme()
  const t = useTranslations("shell")
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const modes = [
    { mode: "light", Icon: Sun, label: t("themeLight") },
    { mode: "system", Icon: Monitor, label: t("themeAuto") },
    { mode: "dark", Icon: Moon, label: t("themeDark") },
  ] as const

  return (
    <div className="theme" role="radiogroup" aria-label={t("theme")}>
      {modes.map(({ mode, Icon, label }) => {
        const active = mounted && (theme ?? "system") === mode
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            className={cn("tbtn", active && "active")}
            onClick={() => setTheme(mode)}
          >
            <Icon strokeWidth={2.2} />
          </button>
        )
      })}
    </div>
  )
}
