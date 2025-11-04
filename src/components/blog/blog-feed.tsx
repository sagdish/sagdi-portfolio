"use client"

import { useMemo, useState } from "react"
import type { BlogPost } from "@/types/blog"
import { cn } from "@/lib/utils"
import { BlogPostCard } from "./blog-post-card"

type Props = {
  posts: BlogPost[]
  tags: string[]
}

const BASE_TAG_CLASSES =
  "inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors cursor-pointer"

export function BlogFeed({ posts, tags }: Props) {
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const sortedTags = useMemo(() => [...tags], [tags])

  const filteredPosts = useMemo(() => {
    if (!activeTag) {
      return posts
    }

    return posts.filter((post) => post.tags.includes(activeTag))
  }, [activeTag, posts])

  const handleSelect = (tag: string | null) => {
    setActiveTag((current) => (current === tag ? null : tag))
  }

  return (
    <div className="space-y-6">
      {sortedTags.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Topics</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleSelect(null)}
              aria-pressed={activeTag === null}
              className={cn(
                BASE_TAG_CLASSES,
                "border-foreground/10 bg-muted text-foreground/80 hover:bg-muted/80 dark:border-muted/40",
                activeTag === null &&
                  "border-primary/40 bg-primary/10 text-primary dark:border-primary/50"
              )}
            >
              All
            </button>
            {sortedTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleSelect(tag)}
                aria-pressed={activeTag === tag}
                className={cn(
                  BASE_TAG_CLASSES,
                  "border-foreground/10 bg-muted text-foreground/80 hover:bg-muted/80 dark:border-muted/40",
                  activeTag === tag &&
                    "border-primary/40 bg-primary/10 text-primary dark:border-primary/50"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
          {activeTag && filteredPosts.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No posts tagged with{" "}
              <span className="font-medium">{activeTag}</span> yet.
            </p>
          )}
        </div>
      )}

      <div className="grid gap-6">
        {filteredPosts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
