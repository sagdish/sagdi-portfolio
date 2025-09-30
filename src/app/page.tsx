import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
          Sagdi Formanov
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
          Product Manager & Product Owner (PSPO I) specializing in
          cross-functional team leadership and product strategy.
          <br /> Beyond job titles, I see myself as someone constantly exploring
          products, places, and even my own perspective.
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
