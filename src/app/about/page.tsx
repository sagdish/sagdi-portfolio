import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About | Sagdi Formanov",
  description: "About Sagdi Formanov.",
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">About</h1>
      <p className="mt-3 text-foreground/80">
        A short profile and background will go here.
      </p>
    </div>
  )
}
