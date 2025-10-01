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

export function PMPortfolioSection() {
  const [hovered, setHovered] = React.useState<number | null>(null)
  const cards = PM_CARDS

  return (
    <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Highlights
        </h2>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:gap-8">
        {cards.map((card, i) => (
          <Card
            key={card.title}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className={clsx(
              "group relative overflow-hidden transition-all duration-200",
              hovered === i
                ? "border-primary/40 shadow-md ring-1 ring-primary/10"
                : "hover:border-primary/30 hover:shadow-sm"
            )}
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
    </section>
  )
}
