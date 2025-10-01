import type { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
  title: "About | Sagdi Formanov",
  description: "About Sagdi Formanov, a Product Manager based in the Bay Area.",
}
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Use grid for desktop, but allow float behavior on mobile */}
      <div className="md:grid md:grid-cols-3 md:gap-8">
        {/* Image container with float for mobile */}
        <div className="md:col-span-1 float-left w-1/2 mr-4 mb-2 md:float-none md:w-full md:mr-0 md:mb-0">
          <div className="relative md:scale-90">
            <Image
              src="/sagdi.jpg"
              alt="Sagdi Formanov"
              width={800}
              height={1000}
              sizes="(min-width: 1024px) 30vw, 50vw"
              className="w-full rounded-2xl shadow-lg ring-1 ring-black/5 dark:ring-white/10"
              priority={false}
            />
            <div className="absolute -top-4 left-2 md:-top-6 md:-left-3">
              <div className="rounded-2xl bg-blue-600 text-white dark:bg-blue-500 px-4 py-2 text-sm md:text-base font-semibold shadow-lg">
                Hey,
              </div>
            </div>
          </div>
        </div>
        {/* Text container that will wrap around the float */}
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold">About Me</h1>
          <p className="mt-3 text-foreground/80">
            Hey, I’m Sagdi. I started out in Automobile Engineering, then moved
            through development and design before finding my place in product
            management. That mix of backgrounds shaped how I work today: I like
            to experiment, create, and learn by doing. Nothing is ever constant,
            so I’ve come to favor action over perfection.
          </p>
        </div>
      </div>
    </div>
  )
}
