import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Projects | Sagdi Formanov",
  description: "Portfolio projects by Sagdi Formanov.",
}

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Projects</h1>
      <p className="mt-3 text-foreground/80">
        Projects will be showcased here.
      </p>
    </div>
  )
}
