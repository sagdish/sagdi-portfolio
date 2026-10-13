"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Reveal } from "@/components/ui/reveal"
import type { BlogPost } from "@/types/blog"

export type MonthYear = { month: string; year: string }

/**
 * Writing list with tag filter-in-place: chips narrow the list client-side, no tag
 * URLs (per the resolved decision). "All" clears the filter.
 * `dates` (post id → month and year) comes formatted from the server.
 */
export function WritingList({
  posts,
  dates,
  tags,
  allLabel,
}: {
  posts: BlogPost[]
  dates: Record<string, MonthYear>
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
        {shown.map((p) => {
          const { month, year } = dates[p.id]
          return (
            <Reveal key={p.id} href={`/writing/${p.slug}`} className="post">
              <span className="date">
                <span>{month}</span>
                <span>{year}</span>
              </span>
              <div>
                <div className="t">{p.title}</div>
                <div className="x">{p.description}</div>
                {p.tags.length > 0 && (
                  <div className="tags">
                    {p.tags.map((tag) => (
                      <span key={tag} className="tagchip static">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          )
        })}
      </div>
    </>
  )
}
