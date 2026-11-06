"use client"

import * as React from "react"
import type { ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { Link } from "@/i18n/navigation"

/**
 * Home "in progress" card body: the heading row, the first item, and a
 * collapsible part (the other items + a "See all projects" link to /building).
 * The chevron at the right end of the heading row slides the collapsible part
 * open and shut. It starts closed, server-rendered, so nothing moves on load.
 */
export function CurrentlyCard({
  heading,
  items,
  moreLabel,
  allLabel,
}: {
  heading: string
  items: ReactNode[]
  /** screen-reader label of the chevron; aria-expanded gives its state */
  moreLabel: string
  /** text of the link to the Projects page, shown only when open */
  allLabel: string
}) {
  const [open, setOpen] = React.useState(false)
  const moreId = React.useId()
  const [first, ...rest] = items

  return (
    <>
      <div className="cur-head">
        <span className="cur-cursor" aria-hidden />
        <h2 className="lbl">{heading}</h2>
        <button
          type="button"
          className="cur-toggle"
          aria-label={moreLabel}
          aria-expanded={open}
          aria-controls={moreId}
          onClick={() => setOpen((v) => !v)}
        >
          <ChevronDown className="cur-chev" size={14} aria-hidden />
        </button>
      </div>
      <ul className="cur-list">
        <li>{first}</li>
      </ul>
      <div id={moreId} className="cur-more" data-open={open}>
        <div className="cur-more-in">
          <ul className="cur-list">
            {rest.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <div className="cur-all">
            <Link href="/building">{allLabel} →</Link>
          </div>
        </div>
      </div>
    </>
  )
}
