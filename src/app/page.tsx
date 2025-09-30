import { Button } from "@/components/ui/button"
import { HeroMap } from "@/components/sections/hero-map"
import { heroMarkers } from "@/components/sections/map-markers"
import Link from "next/link"

export default function Home() {
  return (
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
  )
}
