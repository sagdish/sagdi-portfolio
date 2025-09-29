"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { Menu, Moon, Sun, X } from "lucide-react"

import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Projects", href: "/projects" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
]

export function Navigation() {
  const { theme, setTheme } = useTheme()
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
      <div className="pl-3 pr-3 sm:pr-4 lg:pr-6">
        <div className="flex h-14 items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/chrome.png"
              alt="Sagdi logo"
              width={32}
              height={32}
              className="rounded"
              priority
            />
            <span className="sr-only">Home</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm text-foreground/80 hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <Button
              aria-label="Toggle theme"
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              aria-label="Toggle theme"
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Button
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              variant="ghost"
              size="sm"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        id="mobile-nav"
        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-200 ${mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-3 sm:px-4 lg:px-6 pb-3">
          <div className="mx-1 rounded-lg border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70 shadow-sm">
            <nav className="flex flex-col gap-2 p-3" aria-label="Mobile">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm text-foreground/90 hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </nav>
  )
}
