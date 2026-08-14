"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { Moon, Sun, Monitor } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Cycle order per design: dark → light → auto (system) → …
const CYCLE = ["dark", "light", "system"] as const
type ThemeValue = (typeof CYCLE)[number]

const ICON: Record<ThemeValue, typeof Sun> = {
  dark: Moon,
  light: Sun,
  system: Monitor,
}

function labelKey(v: ThemeValue) {
  return v === "system"
    ? "themeAuto"
    : v === "dark"
      ? "themeDark"
      : "themeLight"
}

/**
 * mode="cycle"   → single button that cycles dark → light → auto (desktop navbar)
 * mode="options" → three icon buttons for light / dark / auto (mobile menu)
 */
export function ThemeToggle({ mode }: { mode: "cycle" | "options" }) {
  const t = useTranslations("nav")
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  if (mode === "options") {
    // Display order: light, dark, auto
    const options: ThemeValue[] = ["light", "dark", "system"]
    return (
      <div
        role="group"
        aria-label={t("toggleTheme")}
        className="mt-1 flex items-center gap-1 border-t border-border/60 pt-3"
      >
        {options.map((value) => {
          const Icon = ICON[value]
          const active = mounted && theme === value
          return (
            <Button
              key={value}
              type="button"
              variant="ghost"
              size="sm"
              aria-label={t(labelKey(value))}
              aria-pressed={active}
              onClick={() => setTheme(value)}
              className={cn(
                active &&
                  "bg-foreground/15 text-accent-foreground dark:bg-accent"
              )}
            >
              <Icon className="h-5 w-5" />
            </Button>
          )
        })}
      </div>
    )
  }

  // mode === "cycle"
  const current: ThemeValue =
    mounted && (CYCLE as readonly string[]).includes(theme ?? "")
      ? (theme as ThemeValue)
      : "system"
  const Icon = ICON[current]
  const next = CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length]

  return (
    <Button
      type="button"
      aria-label={t("toggleTheme")}
      title={t(labelKey(current))}
      variant="ghost"
      size="sm"
      onClick={() => setTheme(next)}
      className="hover:bg-foreground/15 dark:hover:bg-accent"
    >
      <Icon className="h-4 w-4" />
    </Button>
  )
}
