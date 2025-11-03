import type { Metadata } from "next"
import { getPublishedPosts, getAllTags } from "@/lib/notion"
import { BlogPostCard } from "@/components/blog/blog-post-card"

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Blog</h1>
        <p className="text-muted-foreground">
          Insights on product management, strategy, and leadership
        </p>
      </div>

      {/* Tags filter (optional - can be enhanced with client-side filtering) */}
      {tags.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Topics
          </h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground/70 hover:bg-muted/80 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Posts grid */}
      <div className="grid gap-6">
        {posts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
