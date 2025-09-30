import { Button } from "@/components/ui/button"
import { HeroMap } from "@/components/sections/hero-map"
import { heroMarkers } from "@/components/sections/map-markers"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <>
      {/* Hero section */}
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 overflow-hidden md:mt-4 lg:mt-5 md:min-h-[50svh] lg:min-h-[55svh] ">
        {/* Background dotted map (client-only, no SSR) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 origin-center scale-[1.40]"
        >
          <HeroMap markers={heroMarkers} />
          <div className="to-background absolute inset-0 bg-radial from-transparent to-80%" />
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Sagdi Formanov
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-800 dark:text-gray-300">
            Product Manager & Product Owner (PSPO I) specializing in
            cross-functional
            <br />
            team leadership and product strategy.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="/projects">View Projects</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* About content (moved from /about, placed after hero) */}
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-4 text-foreground/90 leading-relaxed">
          {/* Float image so text wraps around it */}
          <Image
            src="/sagdi.jpg"
            alt="Sagdi Formanov"
            width={800}
            height={1000}
            sizes="(min-width: 1024px) 30vw, 50vw"
            className="float-right w-1/2 md:w-1/2 lg:w-[30%] ml-4 mb-3 md:ml-6 md:mb-4 rounded-2xl shadow-lg ring-1 ring-black/5 dark:ring-white/10"
            priority={false}
          />
          <p>
            Hey, I’m Sagdi. I started out in Automobile Engineering, then moved
            through development and design before finding my place in product
            management. That mix of backgrounds shaped how I work today: I like
            to experiment, create, and learn by doing. Nothing is ever constant,
            so I’ve come to favor action over perfection, a lesson I had to
            learn the hard way.
          </p>
          <p>
            As a PM with a software development background, I focus on building
            products that are both user centered and business driven. I’ve led
            teams to launch customer facing features, improve engagement, and
            make collaboration across design and engineering more transparent.
            In my previous roles, I managed the full product lifecycle from
            early research and prototyping to stakeholder collaboration and
            Agile delivery.
          </p>
          <p>
            I’m passionate about user experience, design, and mainly how AI
            technology evolves faster than we can adapt. My way of dealing with
            that is to stay comfortable with discomfort, keep learning, and keep
            building.
          </p>
          {/* Clear the float to avoid affecting following sections */}
          <div className="clear-both" />
        </div>
      </div>
    </>
  )
}
