"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Particles } from "@/components/ui/particles"
import Link from "next/link"
import Image from "next/image"
import { PMPortfolioSection } from "@/components/sections/pm-portfolio"

export default function Home() {
  const { resolvedTheme } = useTheme()
  const [color, setColor] = React.useState("#ffffff")

  React.useEffect(() => {
    setColor(resolvedTheme === "dark" ? "#ffffff" : "#000000")
  }, [resolvedTheme])
  return (
    <>
      {/* About section (now the top section) */}
      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:py-32 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background particles behind about section */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 -translate-y-[15%] sm:translate-y-0"
        >
          <Particles
            className="absolute inset-0"
            quantity={100}
            ease={50}
            staticity={50}
            size={0.4}
            color={color}
            refresh={false}
          />
        </div>

        <div className="relative grid grid-cols-1 gap-4 md:gap-6 lg:gap-8 items-start">
          {/* Centered content */}
          <div className="col-span-1 flex flex-col items-center text-center">
            {/* H1 with blue text instead of blue background */}
            <div className="mt-4 relative z-10">
              <h1 className="whitespace-wrap text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-[#4686EB]">
                Sagdi Formanov
              </h1>
            </div>
            <h2 className="mt-8 max-w-2xl text-lg font-medium md:text-2xl leading-7 text-gray-800 dark:text-gray-300">
              Product Manager & Product Owner (PSPO I) specializing in
              cross-functional team leadership and product strategy.
            </h2>
            {/* CTA back in-column (center mobile, left md+) */}
            <div className="mt-12 flex justify-center">
              <Button asChild size="lg">
                <Link href="/projects">View Projects</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* PM portfolio section (migrated from old site) */}
      <PMPortfolioSection />
    </>
  )
}
