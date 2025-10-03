"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { Menu, Moon, Sun, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { BorderBeam } from "@/components/ui/border-beam"

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
      <div className="pl-2 md:pl-4 lg:pl-6 pr-3 sm:pr-4 lg:pr-6">
        <div className="flex h-14 items-center justify-between relative">
          {/* Left cluster: mobile menu + brand */}
          <div className="flex items-center gap-2">
            {/* Mobile hamburger (left) */}
            <Button
              className="md:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
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
                alt="Sagdi logo"
                width={38}
                height={38}
                className="rounded"
                priority
              />
              <span className="sr-only">Home</span>
            </Link>
          </div>

          {/* Desktop nav (left of bar) */}
          <div className="hidden md:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-base text-foreground/80 hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop right side: CTA + theme */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              aria-label="Toggle theme"
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <div className="relative rounded-md">
              <Button asChild size="sm">
                <Link
                  href="https://pilotyourself.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  pilotyourself - <span className="text-red-500">live</span>
                </Link>
              </Button>
              <BorderBeam size={50} duration={8} borderWidth={1} />
            </div>
          </div>

          {/* Mobile right: CTA + theme */}
          <div className="md:hidden flex items-center gap-3">
            <Button
              aria-label="Toggle theme"
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <div className="relative rounded-md">
              <Button asChild size="sm">
                <Link
                  href="https://pilotyourself.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  pilotyourself - <span className="text-red-500">live</span>
                </Link>
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
            <nav className="flex flex-col gap-2 p-3" aria-label="Mobile">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-base text-foreground/90 hover:text-foreground"
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
