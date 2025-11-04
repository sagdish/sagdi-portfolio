import Link from "next/link"
import { Calendar, Tag } from "lucide-react"
import type { BlogPost } from "@/types/blog"

type Props = {
  post: BlogPost
}

export function BlogPostCard({ post }: Props) {
  const formattedDate = new Date(post.publishedDate).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  )

  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.publishedDate}>{formattedDate}</time>
            </div>
          </div>

          <h3 className="text-xl font-semibold leading-tight mb-2 hover:text-primary transition-colors">
            {post.title}
          </h3>

          {post.description && (
            <p className="text-sm text-foreground/80 leading-relaxed mb-4">
              {post.description}
            </p>
          )}

          {post.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
