"use client"

import * as React from "react"
import clsx from "clsx"
import { useTranslations } from "next-intl"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Order of the highlight cards; copy lives in messages under `pmCards.<key>`.
const CARD_KEYS = [
  "leadership",
  "technical",
  "focus",
  "crossFunctional",
  "values",
] as const

interface CardWithId {
  id: string
  key: (typeof CARD_KEYS)[number]
}

export function PMPortfolioSection() {
  const t = useTranslations("pmCards")
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = React.useState(false)

  // Create multiple sets of cards with unique IDs for seamless infinite scroll
  const createCardSets = React.useMemo(() => {
    const sets: CardWithId[] = []
    for (let setIndex = 0; setIndex < 3; setIndex++) {
      CARD_KEYS.forEach((key, cardIndex) => {
        sets.push({
          id: `${setIndex}-${cardIndex}-${key}`,
          key,
        })
      })
    }
    return sets
  }, [])

  // Handle mouse wheel horizontal scroll
  const handleWheel = React.useCallback((e: React.WheelEvent) => {
    if (scrollContainerRef.current) {
      e.preventDefault()
      scrollContainerRef.current.scrollLeft += e.deltaY
    }
  }, [])

  // Handle pause/resume events
  const handlePause = React.useCallback(() => {
    setIsPaused(true)
  }, [])

  const handleResume = React.useCallback(() => {
    setIsPaused(false)
  }, [])

  return (
    <section className="mx-auto max-w-4xl px-4 pt-8 pb-10 sm:px-6 sm:pt-10 sm:pb-14 lg:px-6">
      {/* Header */}
      <div className="mb-[0.9rem] text-center sm:mb-[1.2rem] lg:mb-[0.9rem]">
        <h2 className="text-base font-bold tracking-tight text-muted-foreground sm:text-2xl">
          {t("heading")}
        </h2>
      </div>

      {/* Horizontal Scrolling Container */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          onWheel={handleWheel}
          onMouseEnter={handlePause}
          onMouseLeave={handleResume}
          onTouchStart={handlePause}
          onTouchEnd={handleResume}
          className="overflow-x-auto scrollbar-hide overscroll-x-contain"
        >
          {/* Marquee Content */}
          <div
            className={clsx(
              "flex w-fit animate-marquee-scroll gap-2 sm:gap-3 lg:gap-2",
              isPaused && "paused"
            )}
          >
            {createCardSets.map((card) => (
              <Card
                key={card.id}
                className="group relative w-64 shrink-0 overflow-hidden py-5 transition-transform duration-200 scale-[0.88] hover:border-primary/30 hover:shadow-sm hover:ring-1 hover:ring-primary/10 sm:w-72 sm:scale-90 md:w-72 md:scale-95 lg:w-72 lg:scale-95 lg:py-4"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-gradient-to-br from-primary/5 to-primary/10" />
                <CardHeader className="px-5 lg:px-4">
                  <CardTitle className="text-sm font-semibold sm:text-base lg:text-sm">
                    {t(`${card.key}.title`)}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-sm lg:text-xs">
                    {t(`${card.key}.description`)}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Left fade gradient */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-background to-transparent z-10" />

        {/* Right fade gradient */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-background to-transparent z-10" />
      </div>
    </section>
  )
}
