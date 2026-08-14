"use client"

import * as React from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Link, usePathname } from "@/i18n/navigation"
import { Menu, X, Home, User, Settings, PenLine, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { BorderBeam } from "@/components/ui/border-beam"
import { LanguageSwitcher } from "./language-switcher"
import { ThemeToggle } from "./theme-toggle"

const navigation = [
  { key: "home", href: "/", icon: Home },
  { key: "about", href: "/about", icon: User },
  { key: "projects", href: "/projects", icon: Settings },
  { key: "blog", href: "/blog", icon: PenLine },
  { key: "contact", href: "/contact", icon: Mail },
] as const

export function Navigation() {
  const t = useTranslations("nav")
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  React.useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false)
    }
    window.addEventListener("keydown", onEsc)
    return () => window.removeEventListener("keydown", onEsc)
  }, [])

  return (
    <nav aria-label="Primary">
      <div className="pl-2 md:pl-4 lg:pl-6 pr-3 sm:pr-4 lg:pr-6">
        <div className="flex h-14 items-center justify-between relative">
          {/* Left cluster: mobile menu + brand */}
          <div className="flex items-center gap-2">
            {/* Mobile hamburger (left) */}
            <Button
              className="md:hidden"
              aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              variant="ghost"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>

            {/* Brand */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/chrome.png"
                alt={t("logoAlt")}
                width={38}
                height={38}
                className="rounded"
                priority
              />
              <span className="sr-only">{t("homeSr")}</span>
            </Link>
          </div>

          {/* Desktop nav (left of bar) */}
          <div className="hidden md:flex items-center gap-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`text-base transition-colors ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-foreground/80 hover:text-foreground"
                  }`}
                >
                  {t(item.key)}
                </Link>
              )
            })}
          </div>

          {/* Desktop right side: language + theme + CTA */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle mode="cycle" />
            <div className="relative rounded-md">
              <Button asChild size="sm">
                <a
                  href="https://pilotyourself.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ReguSelf - <span className="text-red-500">live</span>
                </a>
              </Button>
              <BorderBeam size={50} duration={8} borderWidth={1} />
            </div>
          </div>

          {/* Mobile right: language switcher (replaces theme) + CTA */}
          <div className="md:hidden flex items-center gap-3">
            <LanguageSwitcher />
            <div className="relative rounded-md">
              <Button asChild size="sm">
                <a
                  href="https://pilotyourself.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ReguSelf - <span className="text-red-500">live</span>
                </a>
              </Button>
              <BorderBeam size={70} duration={8} borderWidth={2} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        id="mobile-nav"
        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-200 ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-3 sm:px-4 lg:px-6 pb-3">
          <div className="mx-1 rounded-lg border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70 shadow-sm">
            <nav className="flex flex-col gap-[0.8rem] p-3" aria-label="Mobile">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`flex items-center gap-2 text-base ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400 font-semibold"
                        : "text-foreground/90 hover:text-foreground"
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    {t(item.key)}
                  </Link>
                )
              })}

              {/* Theme controls live here on mobile (top bar holds the language switcher) */}
              <ThemeToggle mode="options" />
            </nav>
          </div>
        </div>
      </div>
    </nav>
  )
}
