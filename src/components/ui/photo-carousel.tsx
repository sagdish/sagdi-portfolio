"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react"
import Image, { getImageProps } from "next/image"
import dynamic from "next/dynamic"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Photo } from "@/lib/photos"
import { PhotoCount } from "./photo-count"
import type { PhotoViewerLabels } from "./photo-viewer"
import { childOffsets, glideTo, nearestIndex } from "./scroll-glide"

// The viewer and its dialog library are fetched only once someone reaches for
// the strip (hover, touch or focus), so the page itself stays light.
const loadViewer = () => import("./photo-viewer").then((m) => m.PhotoViewer)
const PhotoViewer = dynamic(loadViewer, { ssr: false })

// Frames whose file loads straight away, from the server HTML, so the browser
// finds them before any script runs. About what a phone shows.
const EAGER = 2

// The blur Next's image placeholder paints, for a frame whose photo hasn't
// started loading yet: it looks the same before and while the photo loads.
function blurBackground(p: Photo): string | undefined {
  if (!p.blurDataURL) return undefined
  const { props } = getImageProps({
    src: p.src,
    width: p.width,
    height: p.height,
    alt: "",
    unoptimized: true,
    placeholder: "blur",
    blurDataURL: p.blurDataURL,
  })
  return props.style?.backgroundImage as string | undefined
}

type PhotoCarouselProps = {
  photos: Photo[]
  /** aria-label for the scrollable region */
  label: string
  /** button and viewer labels — passed in so the component stays i18n-free */
  labels: {
    prev: string
    next: string
    /** a frame's button: "Open photo" + its number */
    open: string
    viewer: PhotoViewerLabels
  }
  className?: string
}

/**
 * Contact-sheet filmstrip: one fixed row height, each frame's width follows the
 * photo's true aspect ratio (portrait narrow, pano wide — no cropping). Video
 * frames are muted clips that play while mostly inside the strip. The track
 * is a native scroller (touch momentum + snap for free); arrows and the mono
 * counter are progressive chrome on top. A tap on a frame opens it full screen
 * in the photo viewer. Presentational only — data comes from the caller, so it
 * can sit on any page over any photo source.
 */
export function PhotoCarousel({
  photos,
  label,
  labels,
  className,
}: PhotoCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLUListElement | null>(null)
  const rafRef = useRef(0)
  const stopGlideRef = useRef<() => void>(() => {})
  const [index, setIndex] = useState(0)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(true)
  // The photo open in the viewer, or null; and whether it was ever opened
  // (it stays mounted after that, so it can fade out).
  const [viewer, setViewer] = useState<number | null>(null)
  const [viewerUsed, setViewerUsed] = useState(false)
  const openViewer = (i: number) => {
    setViewer(i)
    setViewerUsed(true)
  }
  // A page can outlive the photo list it was built from: publishing deletes the
  // files a photo no longer needs. A frame whose file is gone drops out of the
  // strip instead of sitting there as a broken image.
  const [gone, setGone] = useState<string[]>([])
  const shown = photos.filter((p) => !gone.includes(p.src))
  const shownKey = shown.map((p) => p.src).join("|")
  const drop = (src: string) =>
    setGone((was) => (was.includes(src) ? was : [...was, src]))

  // Loading order. The first EAGER frames load at once, the first photo at top
  // priority. Every later frame waits until those photos are done (so nothing
  // shares the connection with them), then loads once it is within one strip
  // width of view: left to right as the strip scrolls. `reach` is the last
  // frame allowed to load.
  const [primed, setPrimed] = useState(false)
  const [reach, setReach] = useState(EAGER - 1)
  const firstPhoto = shown.findIndex((p) => p.type !== "video")

  useEffect(() => {
    if (primed) return
    const imgs = Array.from(
      trackRef.current?.querySelectorAll<HTMLImageElement>("img[data-eager]") ??
        []
    ).filter((img) => !img.complete)
    if (!imgs.length) {
      setPrimed(true)
      return
    }
    let left = imgs.length
    const done = () => {
      left -= 1
      if (left === 0) setPrimed(true)
    }
    imgs.forEach((img) => {
      img.addEventListener("load", done, { once: true })
      img.addEventListener("error", done, { once: true })
    })
    return () =>
      imgs.forEach((img) => {
        img.removeEventListener("load", done)
        img.removeEventListener("error", done)
      })
  }, [primed])

  useEffect(() => {
    const scroller = scrollerRef.current
    const items = Array.from(trackRef.current?.children ?? [])
    if (!primed || !scroller || reach >= items.length - 1) return
    const io = new IntersectionObserver(
      (entries) => {
        let last = -1
        for (const e of entries) {
          if (e.isIntersecting) last = Math.max(last, items.indexOf(e.target))
        }
        if (last > -1) setReach((was) => Math.max(was, last))
      },
      { root: scroller, rootMargin: "0px 100% 0px 0px" }
    )
    items.slice(reach + 1).forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [primed, reach, shownKey])

  const update = useCallback(() => {
    const el = scrollerRef.current
    const track = trackRef.current
    if (!el || !track?.children.length) return
    const end = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1
    setAtStart(el.scrollLeft <= 1)
    setAtEnd(end)
    setIndex(
      end
        ? track.children.length - 1
        : nearestIndex(childOffsets(track), el.scrollLeft)
    )
  }, [])

  const onScroll = useCallback(() => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0
      update()
    })
  }, [update])

  useEffect(() => {
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("resize", update)
      cancelAnimationFrame(rafRef.current)
      stopGlideRef.current()
    }
  }, [update])

  // On mount, and again whenever a frame drops out (the strip got shorter).
  useEffect(update, [update, shownKey])

  // Videos play muted only while at least 60% of their frame is inside the
  // strip, the strip itself is on screen, and the viewer is closed; paused the
  // moment any of that stops being true. A clip set to play once plays once
  // per time it comes into view. Two observers because an element-rooted
  // observer ignores whether that root is itself visible in the viewport.
  const viewing = viewer !== null
  useEffect(() => {
    const scroller = scrollerRef.current
    const videos = Array.from(trackRef.current?.querySelectorAll("video") ?? [])
    if (!scroller || !videos.length) return
    const inStrip = new Set<Element>()
    const finished = new Set<Element>()
    let stripVisible = false
    const sync = () => {
      for (const v of videos) {
        if (viewing || !stripVisible || !inStrip.has(v)) {
          if (!v.paused) v.pause()
          finished.delete(v)
        } else if (v.paused && !finished.has(v)) {
          v.muted = true
          v.play().catch(() => {})
        }
      }
    }
    const onEnded = (e: Event) => finished.add(e.currentTarget as Element)
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
    videos.forEach((v) => {
      inStripIO.observe(v)
      v.addEventListener("ended", onEnded)
    })
    viewIO.observe(scroller)
    return () => {
      inStripIO.disconnect()
      viewIO.disconnect()
      videos.forEach((v) => {
        v.removeEventListener("ended", onEnded)
        v.pause()
      })
    }
  }, [shownKey, viewing])

  const glide = (left: number) => {
    const el = scrollerRef.current
    if (!el) return
    stopGlideRef.current()
    stopGlideRef.current = glideTo(el, left, update)
  }

  // One page along, landing exactly on a frame: the frame nearest to 85% of a
  // screen away, and always at least one frame of progress.
  const page = (dir: -1 | 1) => {
    const el = scrollerRef.current
    const track = trackRef.current
    if (!el || !track?.children.length) return
    const offsets = childOffsets(track)
    const current = nearestIndex(offsets, el.scrollLeft)
    let target = nearestIndex(
      offsets,
      el.scrollLeft + dir * el.clientWidth * 0.85
    )
    if (target === current) target = current + dir
    glide(offsets[Math.max(0, Math.min(offsets.length - 1, target))])
  }

  // Back from the viewer: focus the photo it was on, and bring that frame
  // into the strip if it isn't fully there.
  const onViewerClosed = (i: number) => {
    const el = scrollerRef.current
    const track = trackRef.current
    const item = track?.children[i] as HTMLElement | undefined
    if (!el || !track || !item) return
    item.querySelector("button")?.focus({ preventScroll: true })
    const frame = item.getBoundingClientRect()
    const strip = el.getBoundingClientRect()
    if (frame.left < strip.left - 1 || frame.right > strip.right + 1) {
      glide(childOffsets(track)[i])
    }
  }

  if (!shown.length) return null

  return (
    <div className={cn("pcar", className)}>
      <div
        className="pcar-strip"
        onPointerEnter={() => void loadViewer()}
        onFocus={() => void loadViewer()}
      >
        <div
          ref={scrollerRef}
          role="region"
          aria-label={label}
          tabIndex={0}
          onScroll={onScroll}
          className="pcar-scroller"
        >
          <ul ref={trackRef} className="pcar-track">
            {shown.map((p, i) => (
              <li key={p.src} className="pcar-item">
                <button
                  type="button"
                  className="pcar-frame"
                  style={{ "--ar": p.width / p.height } as CSSProperties}
                  aria-label={`${labels.open} ${i + 1} / ${shown.length}`}
                  onClick={() => openViewer(i)}
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
                      loop={p.loop !== false}
                      preload={i <= reach ? "metadata" : "none"}
                      draggable={false}
                      onError={() => drop(p.src)}
                    />
                  ) : i <= reach ? (
                    // Strip-sized WebP served straight from the bucket:
                    // no Next optimizer in the path (its 7s upstream fetch
                    // timeout broke frames on slow links), one size fits the
                    // fixed-height strip. Blur while loading. Only rendered
                    // once its turn comes (see `reach`), so it loads at once.
                    <Image
                      className="pcar-img"
                      src={p.src}
                      width={p.width}
                      height={p.height}
                      alt={p.alt}
                      unoptimized
                      loading="eager"
                      fetchPriority={i === firstPhoto ? "high" : undefined}
                      data-eager={i < EAGER ? "" : undefined}
                      placeholder={p.blurDataURL ? "blur" : "empty"}
                      blurDataURL={p.blurDataURL}
                      draggable={false}
                      onError={() => drop(p.src)}
                    />
                  ) : (
                    // Not its turn yet: the same blur, no request.
                    <span
                      className="pcar-img pcar-ph"
                      aria-hidden="true"
                      style={
                        { "--ph": blurBackground(p) ?? "none" } as CSSProperties
                      }
                    />
                  )}
                </button>
                {p.caption && <div className="pcar-cap">{p.caption}</div>}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="pcar-foot">
        <PhotoCount index={index} total={shown.length} />
        <div className="pcar-btns">
          <button
            type="button"
            className="pcar-btn"
            aria-label={labels.prev}
            disabled={atStart}
            onClick={() => page(-1)}
          >
            <ChevronLeft size={14} aria-hidden />
          </button>
          <button
            type="button"
            className="pcar-btn"
            aria-label={labels.next}
            disabled={atEnd}
            onClick={() => page(1)}
          >
            <ChevronRight size={14} aria-hidden />
          </button>
        </div>
      </div>
      {viewerUsed && (
        <PhotoViewer
          photos={shown}
          openAt={viewer}
          labels={labels.viewer}
          onClose={() => setViewer(null)}
          onClosed={onViewerClosed}
        />
      )}
    </div>
  )
}
