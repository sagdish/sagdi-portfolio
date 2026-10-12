"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Reveal } from "@/components/ui/reveal"
import type { BlogPost } from "@/types/blog"

/** Month and year as two lines ("Oct" over "2026") for the narrow date column. */
function monthYear(iso: string, locale: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { month: iso, year: "" }
  return {
    month: d.toLocaleDateString(locale, { month: "short", timeZone: "UTC" }),
    year: String(d.getUTCFullYear()),
  }
}

/**
 * Writing list with tag filter-in-place: chips narrow the list client-side, no tag
 * URLs (per the resolved decision). "All" clears the filter.
 */
export function WritingList({
  posts,
  tags,
  locale,
  allLabel,
}: {
  posts: BlogPost[]
  tags: string[]
  locale: string
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
          const { month, year } = monthYear(p.publishedDate, locale)
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
