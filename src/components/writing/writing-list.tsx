"use client"

import { useState } from "react"
import { Calendar, Tag } from "lucide-react"
import { cn } from "@/lib/utils"
import { Reveal } from "@/components/ui/reveal"
import type { BlogPost } from "@/types/blog"

/**
 * Writing list with tag filter-in-place: chips narrow the list client-side, no tag
 * URLs (per the resolved decision). "All" clears the filter.
 * Each post is a card (layout from the old site's blog list).
 * `dates` (post id → date text) comes formatted from the server.
 */
export function WritingList({
  posts,
  dates,
  tags,
  allLabel,
}: {
  posts: BlogPost[]
  dates: Record<string, string>
  tags: string[]
  allLabel: string
}) {
  const [active, setActive] = useState<string | null>(null)
  const shown = active ? posts.filter((p) => p.tags.includes(active)) : posts

  return (
    <>
      {tags.length > 0 && (
        <div className="tagbar">
          <button
            type="button"
            className={cn("tagchip", active === null && "on")}
            onClick={() => setActive(null)}
          >
            {allLabel}
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={cn("tagchip", active === tag && "on")}
              onClick={() => setActive(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <div className="posts">
        {shown.map((p) => (
          <Reveal key={p.id} href={`/writing/${p.slug}`} className="card post">
            <div className="date">
              <Calendar size={14} aria-hidden />
              <time dateTime={p.publishedDate}>{dates[p.id]}</time>
            </div>
            <h2>{p.title}</h2>
            {p.description && <p>{p.description}</p>}
            {p.tags.length > 0 && (
              <div className="tags">
                <Tag size={14} aria-hidden />
                {p.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Reveal>
        ))}
      </div>
    </>
  )
}
