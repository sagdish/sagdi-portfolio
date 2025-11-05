import type { Metadata } from "next"
import { getPublishedPosts, getAllTags } from "@/lib/notion"
import { BlogFeed } from "@/components/blog/blog-feed"

export const metadata: Metadata = {
  title: "Blog | Sagdi Formanov",
  description:
    "Articles and insights on product management, strategy, and leadership by Sagdi Formanov.",
}

// Revalidate every 60 seconds (ISR)
export const revalidate = 60

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts()
  const tags = await getAllTags()

  if (posts.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">Blog</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Posts will appear here once published.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Blog</h1>
        <p className="text-muted-foreground">
          Sometimes I write to make sense of things.
        </p>
      </div>

      <BlogFeed posts={posts} tags={tags} />
    </div>
  )
}
