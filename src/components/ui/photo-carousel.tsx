"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Photo } from "@/lib/photos"

type PhotoCarouselProps = {
  photos: Photo[]
  /** aria-label for the scrollable region */
  label: string
  /** aria-labels for the pager buttons — passed in so the component stays i18n-free */
  buttonLabels: { prev: string; next: string }
  className?: string
}

const pad = (n: number) => String(n).padStart(2, "0")

/**
 * Contact-sheet filmstrip: one fixed row height, each frame's width follows the
 * photo's true aspect ratio (portrait narrow, pano wide — no cropping). Video
 * frames are muted clips that autoplay while mostly inside the strip. The track
 * is a native scroller (touch momentum + snap for free); arrows and the mono
 * counter are progressive chrome on top. Presentational only — data comes from
 * the caller, so it can sit on any page over any photo source.
 */
export function PhotoCarousel({
  photos,
  label,
  buttonLabels,
  className,
}: PhotoCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLUListElement | null>(null)
  const rafRef = useRef(0)
  const tweenRef = useRef(0)
  const [index, setIndex] = useState(0)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(true)

  const update = useCallback(() => {
    const el = scrollerRef.current
    const items = trackRef.current?.children
    if (!el || !items?.length) return
    const max = el.scrollWidth - el.clientWidth
    const start = el.scrollLeft <= 1
    const end = el.scrollLeft >= max - 1
    setAtStart(start)
    setAtEnd(end)
    if (end) {
      setIndex(items.length - 1)
      return
    }
    // Nearest snap position — offsets relative to the first item so the
    // scroller's own padding cancels out.
    const base = (items[0] as HTMLElement).offsetLeft
    let best = 0
    let bestDist = Infinity
    for (let i = 0; i < items.length; i++) {
      const d = Math.abs(
        (items[i] as HTMLElement).offsetLeft - base - el.scrollLeft
      )
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    }
    setIndex(best)
  }, [])

  const onScroll = useCallback(() => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0
      update()
    })
  }, [update])

  useEffect(() => {
    update()
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("resize", update)
      cancelAnimationFrame(rafRef.current)
      cancelAnimationFrame(tweenRef.current)
    }
  }, [update])

  // Videos autoplay muted only while at least 60% of their frame is inside the
  // strip AND the strip itself is on screen; paused the moment either stops
  // being true. Two observers because an element-rooted observer ignores
  // whether that root is itself visible in the viewport.
  useEffect(() => {
    const scroller = scrollerRef.current
    const videos = Array.from(trackRef.current?.querySelectorAll("video") ?? [])
    if (!scroller || !videos.length) return
    const inStrip = new Set<Element>()
    let stripVisible = false
    const sync = () => {
      for (const v of videos) {
        if (stripVisible && inStrip.has(v)) {
          if (v.paused) {
            v.muted = true
            v.play().catch(() => {})
          }
        } else if (!v.paused) {
          v.pause()
        }
      }
    }
    const inStripIO = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) inStrip.add(e.target)
          else inStrip.delete(e.target)
        }
        sync()
      },
      { root: scroller, threshold: 0.6 }
    )
    const viewIO = new IntersectionObserver(
      ([e]) => {
        stripVisible = e.isIntersecting
        sync()
      },
      { threshold: 0.5 }
    )
    videos.forEach((v) => inStripIO.observe(v))
    viewIO.observe(scroller)
    return () => {
      inStripIO.disconnect()
      viewIO.disconnect()
      videos.forEach((v) => v.pause())
    }
  }, [photos])

  // Self-driven tween instead of scrollTo({behavior: "smooth"}): native smooth
  // scrolling is unreliable on snap containers (and can be disabled browser-wide),
  // while direct scrollLeft writes always land. Bails out the moment the user
  // scrolls (position deviates from the tween's last write).
  const animateTo = (el: HTMLElement, to: number) => {
    cancelAnimationFrame(tweenRef.current)
    const from = el.scrollLeft
    const dist = to - from
    if (!dist) return
    const dur = 400
    const t0 = performance.now()
    let expected = from
    const step = (now: number) => {
      if (Math.abs(el.scrollLeft - expected) > 2) return
      const t = Math.min(1, (now - t0) / dur)
      expected = from + dist * (1 - Math.pow(1 - t, 3))
      el.scrollLeft = expected
      if (t < 1) tweenRef.current = requestAnimationFrame(step)
    }
    tweenRef.current = requestAnimationFrame(step)
  }

  const page = (dir: -1 | 1) => {
    const el = scrollerRef.current
    const items = trackRef.current?.children
    if (!el || !items?.length) return
    // Scroll to an exact frame offset — a smooth scroll to a non-snap position
    // gets reverted by the snap controller, so the destination must BE a snap
    // point: the frame nearest to one page away, at least one frame of progress.
    const base = (items[0] as HTMLElement).offsetLeft
    const offsets = Array.from(
      items,
      (li) => (li as HTMLElement).offsetLeft - base
    )
    const nearest = (x: number) =>
      offsets.reduce(
        (best, o, i) =>
          Math.abs(o - x) < Math.abs(offsets[best] - x) ? i : best,
        0
      )
    const current = nearest(el.scrollLeft)
    let target = nearest(el.scrollLeft + dir * el.clientWidth * 0.85)
    if (target === current) target = current + dir
    target = Math.max(0, Math.min(offsets.length - 1, target))
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.scrollLeft = offsets[target]
      return
    }
    animateTo(el, offsets[target])
  }

  if (!photos.length) return null

  return (
    <div className={cn("pcar", className)}>
      <div className="pcar-strip">
        <div
          ref={scrollerRef}
          role="region"
          aria-label={label}
          tabIndex={0}
          onScroll={onScroll}
          className="pcar-scroller"
        >
          <ul ref={trackRef} className="pcar-track">
            {photos.map((p) => {
              return (
                <li key={p.src} className="pcar-item">
                  <div
                    className="pcar-frame"
                    style={{ aspectRatio: `${p.width} / ${p.height}` }}
                  >
                    {p.type === "video" ? (
                      // Playback is driven by the observer effect above, not
                      // by autoPlay.
                      <video
                        className="pcar-img"
                        src={p.src}
                        width={p.width}
                        height={p.height}
                        aria-label={p.alt}
                        muted
                        playsInline
                        loop
                        preload="metadata"
                        draggable={false}
                      />
                    ) : (
                      // Strip-sized WebP served straight from the bucket:
                      // no Next optimizer in the path (its 7s upstream fetch
                      // timeout broke frames on slow links), one size fits the
                      // fixed-height strip. Lazy by default, blur while loading.
                      <Image
                        className="pcar-img"
                        src={p.src}
                        width={p.width}
                        height={p.height}
                        alt={p.alt}
                        unoptimized
                        placeholder={p.blurDataURL ? "blur" : "empty"}
                        blurDataURL={p.blurDataURL}
                        draggable={false}
                      />
                    )}
                  </div>
                  {p.caption && <div className="pcar-cap">{p.caption}</div>}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
      <div className="pcar-foot">
        <div className="pcar-count">
          {pad(index + 1)} / {pad(photos.length)}
        </div>
        <div className="pcar-btns">
          <button
            type="button"
            className="pcar-btn"
            aria-label={buttonLabels.prev}
            disabled={atStart}
            onClick={() => page(-1)}
          >
            <ChevronLeft size={14} aria-hidden />
          </button>
          <button
            type="button"
            className="pcar-btn"
            aria-label={buttonLabels.next}
            disabled={atEnd}
            onClick={() => page(1)}
          >
            <ChevronRight size={14} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}
