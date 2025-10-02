"use client"

import * as React from "react"
import clsx from "clsx"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const PM_CARDS = [
  {
    title: "Product Leadership",
    description:
      "Led teams to launch customer-facing features and improve engagement through full product lifecycle management",
  },
  {
    title: "Technical Foundation",
    description:
      "Software development background enabling effective collaboration with engineering teams",
  },
  {
    title: "User & Business Focus",
    description:
      "Building products that balance user needs with business objectives and measurable outcomes",
  },
  {
    title: "Cross-Functional",
    description:
      "Transparent collaboration across design, engineering, and stakeholders from research to Agile delivery",
  },
  {
    title: "Values",
    description:
      "AI technology evolves faster than we can adapt. My way of dealing with that is to stay comfortable with discomfort, keep learning, and keep building.",
  },
]

interface CardWithId {
  id: string
  title: string
  description: string
}

export function PMPortfolioSection() {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = React.useState(false)

  // Create multiple sets of cards with unique IDs for seamless infinite scroll
  const createCardSets = React.useMemo(() => {
    const sets: CardWithId[] = []
    for (let setIndex = 0; setIndex < 3; setIndex++) {
      PM_CARDS.forEach((card, cardIndex) => {
        sets.push({
          id: `${setIndex}-${cardIndex}-${card.title}`,
          title: card.title,
          description: card.description,
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
    <section className="mx-auto max-w-5xl px-4 pt-10 pb-14 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-lg font-bold tracking-tight sm:text-2xl">
          Highlights
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
              "flex gap-4 w-fit animate-marquee-scroll",
              isPaused && "paused"
            )}
          >
            {createCardSets.map((card) => (
              <Card
                key={card.id}
                className="group relative overflow-hidden transition-all duration-200 w-80 shrink-0 hover:border-primary/30 hover:shadow-sm hover:ring-1 hover:ring-primary/10 scale-[0.9]"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-gradient-to-br from-primary/5 to-primary/10" />
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    {card.title}
                  </CardTitle>
                  <CardDescription>{card.description}</CardDescription>
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
