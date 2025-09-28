import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog | Sagdi Formanov",
  description: "Articles and notes by Sagdi Formanov.",
}

export default function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Blog</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-300">
        Posts will appear here once published.
      </p>
    </div>
  )
}
