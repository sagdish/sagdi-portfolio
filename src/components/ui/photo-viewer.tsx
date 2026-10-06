"use client"

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react"
import Image from "next/image"
import * as Dialog from "@radix-ui/react-dialog"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Photo, PhotoFile } from "@/lib/photos"
import { PhotoCount } from "./photo-count"
import { glideTo } from "./scroll-glide"

export type PhotoViewerLabels = {
  /** the dialog's name for screen readers */
  title: string
  close: string
  prev: string
  next: string
}

type PhotoViewerProps = {
  photos: Photo[]
  /** the photo to open at, or null while closed */
  openAt: number | null
  labels: PhotoViewerLabels
  /** the viewer asks to close (button, Esc, back gesture, tap beside the photo) */
  onClose: () => void
  /** it has finished closing, on this photo — where focus should go back to */
  onClosed: (index: number) => void
}

type Box = { width: number; height: number }

// Marks the history entry the viewer adds, per page load: after a reload the
// entry is still there, but it isn't this page's to take back.
const ENTRY = Math.random().toString(36).slice(2)
const ownsEntry = () => window.history.state?.photoViewer === ENTRY

/**
 * Full-screen photo viewer over the photo strip. Native horizontal scroll-snap
 * does the swiping (momentum, one photo per swipe); arrows, ←/→ and the counter
 * sit on top. Each photo is shown whole, as large as the screen allows, from
 * the smallest file that's still sharp on this screen — loaded only when the
 * photo or a neighbour is open. Dark in both themes.
 *
 * The back button or gesture closes it: opening adds a history entry, so
 * "back" takes that entry away instead of leaving the page.
 */
export function PhotoViewer({
  photos,
  openAt,
  labels,
  onClose,
  onClosed,
}: PhotoViewerProps) {
  const open = openAt !== null
  const indexRef = useRef(openAt ?? 0)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    if (!ownsEntry()) window.history.pushState({ photoViewer: ENTRY }, "")
    const onPop = () => onCloseRef.current()
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [open])

  // Closing goes through history, so the entry added on open never lingers;
  // the popstate listener above then does the actual closing.
  const requestClose = () => {
    if (ownsEntry()) window.history.back()
    else onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && requestClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="plb-overlay dark" />
        <Dialog.Content
          ref={contentRef}
          className="plb dark"
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => {
            // Focus the viewer itself (so ←/→ work), not its first button.
            e.preventDefault()
            contentRef.current?.focus()
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            onClosed(indexRef.current)
          }}
        >
          <Dialog.Title className="sr-only">{labels.title}</Dialog.Title>
          {/* Content only exists while open or fading out; `start` is read
              once, when it mounts. */}
          <Stage
            photos={photos}
            start={openAt ?? 0}
            labels={labels}
            indexRef={indexRef}
            onClose={requestClose}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function Stage({
  photos,
  start,
  labels,
  indexRef,
  onClose,
}: {
  photos: Photo[]
  start: number
  labels: PhotoViewerLabels
  indexRef: { current: number }
  onClose: () => void
}) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const startRef = useRef(start)
  const rafRef = useRef(0)
  const stopGlideRef = useRef<() => void>(() => {})
  const [index, setIndex] = useState(start)
  // The space a photo can fill: one slide's content box.
  const [box, setBox] = useState<Box | null>(null)

  const show = (i: number) => {
    indexRef.current = i
    setIndex(i)
  }

  // Open on the tapped photo, with no glide.
  useLayoutEffect(() => {
    const track = trackRef.current
    if (track) track.scrollLeft = startRef.current * track.clientWidth
    show(startRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on open
  }, [])

  // Keep the same photo in place when the screen resizes or rotates, and
  // re-measure the space it can fill.
  useEffect(() => {
    const track = trackRef.current
    const slide = track?.firstElementChild
    if (!track || !slide) return
    const ro = new ResizeObserver(([entry]) => {
      setBox({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
      stopGlideRef.current()
      track.scrollLeft = indexRef.current * track.clientWidth
    })
    ro.observe(slide)
    return () => {
      ro.disconnect()
      stopGlideRef.current()
      cancelAnimationFrame(rafRef.current)
    }
  }, [indexRef])

  const go = (i: number) => {
    const track = trackRef.current
    if (!track || i < 0 || i >= photos.length) return
    stopGlideRef.current()
    stopGlideRef.current = glideTo(track, i * track.clientWidth, onScroll)
  }

  // ←/→ anywhere in the viewer, except while a video's own controls have
  // focus (they use the arrows to seek).
  const goRef = useRef(go)
  goRef.current = go
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.closest?.("video")) return
      if (e.key === "ArrowLeft") goRef.current(indexRef.current - 1)
      else if (e.key === "ArrowRight") goRef.current(indexRef.current + 1)
      else return
      e.preventDefault()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [indexRef])

  const onScroll = () => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0
      const track = trackRef.current
      if (!track?.clientWidth) return
      const i = Math.round(track.scrollLeft / track.clientWidth)
      show(Math.max(0, Math.min(photos.length - 1, i)))
    })
  }

  const caption = photos[index]?.caption

  return (
    <>
      <div ref={trackRef} className="plb-track" onScroll={onScroll}>
        {photos.map((p, i) => (
          <div
            key={p.src}
            className="plb-slide"
            aria-hidden={i !== index}
            // A tap beside the photo closes, like a tap on a backdrop.
            onClick={(e) => e.target === e.currentTarget && onClose()}
          >
            {Math.abs(i - index) <= 1 && (
              <Media photo={p} active={i === index} box={box} />
            )}
          </div>
        ))}
      </div>

      <div className="plb-bar">
        <PhotoCount index={index} total={photos.length} />
        <Dialog.Close className="pcar-btn plb-btn" aria-label={labels.close}>
          <X size={18} aria-hidden />
        </Dialog.Close>
      </div>
      <button
        type="button"
        className="pcar-btn plb-btn plb-nav plb-prev"
        aria-label={labels.prev}
        disabled={index === 0}
        onClick={() => go(index - 1)}
      >
        <ChevronLeft size={18} aria-hidden />
      </button>
      <button
        type="button"
        className="pcar-btn plb-btn plb-nav plb-next"
        aria-label={labels.next}
        disabled={index === photos.length - 1}
        onClick={() => go(index + 1)}
      >
        <ChevronRight size={18} aria-hidden />
      </button>
      {caption && <div className="plb-cap">{caption}</div>}
    </>
  )
}

/**
 * One photo or clip, whole, as large as `box` allows and never past the
 * biggest file there is. The box is sized in CSS (container units), so it
 * never jumps while files load.
 */
function Media({
  photo,
  active,
  box,
}: {
  photo: Photo
  active: boolean
  box: Box | null
}) {
  const files = [photo, ...(photo.views ?? [])]
  const biggest = files[files.length - 1]
  const style = {
    "--ar": photo.width / photo.height,
    "--nw": `${biggest.width}px`,
  } as CSSProperties
  return (
    <div className="plb-media" style={style}>
      {photo.type === "video" ? (
        <Clip photo={photo} active={active} />
      ) : (
        <Still photo={photo} files={files} box={box} />
      )}
    </div>
  )
}

/**
 * The strip's own file shows first (usually cached already, else its blur),
 * with the sharper file fading in on top once loaded. The sharper file is the
 * smallest one at least as wide as the photo will be in device pixels; it
 * never steps down to a smaller one once chosen.
 */
function Still({
  photo,
  files,
  box,
}: {
  photo: Photo
  files: PhotoFile[]
  box: Box | null
}) {
  const want = box ? pick(files, shownWidth(photo, files, box)) : photo
  const [best, setBest] = useState(want)
  if (want.width > best.width) setBest(want)
  const [loaded, setLoaded] = useState<string | null>(null)
  const sharper = best.src !== photo.src

  return (
    <>
      <Image
        className="plb-fill"
        src={photo.src}
        alt={sharper ? "" : photo.alt}
        fill
        sizes="100vw"
        unoptimized
        placeholder={photo.blurDataURL ? "blur" : "empty"}
        blurDataURL={photo.blurDataURL}
        draggable={false}
      />
      {sharper && (
        <Image
          className={cn("plb-fill plb-sharp", loaded === best.src && "in")}
          src={best.src}
          alt={photo.alt}
          fill
          sizes="100vw"
          unoptimized
          draggable={false}
          onLoad={() => setLoaded(best.src)}
        />
      )}
    </>
  )
}

/** Width in device pixels the photo takes on screen — mirrors .plb-media. */
function shownWidth(photo: Photo, files: PhotoFile[], box: Box) {
  const css = Math.min(
    box.width,
    (box.height * photo.width) / photo.height,
    files[files.length - 1].width
  )
  return css * window.devicePixelRatio
}

/** The smallest file at least `width` px wide, else the biggest there is. */
const pick = (files: PhotoFile[], width: number) =>
  files.find((f) => f.width >= width) ?? files[files.length - 1]

/**
 * The open clip plays with sound, looping unless the manager said not to.
 * A phone that won't start sound without a fresh tap gets it muted instead;
 * the video's own controls unmute it.
 */
function Clip({ photo, active }: { photo: Photo; active: boolean }) {
  const ref = useRef<HTMLVideoElement | null>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (!active) {
      v.pause()
      return
    }
    v.muted = false
    v.play().catch(() => {
      v.muted = true
      v.play().catch(() => {})
    })
  }, [active])

  return (
    <video
      ref={ref}
      className="plb-fill"
      src={photo.src}
      width={photo.width}
      height={photo.height}
      aria-label={photo.alt}
      controls
      playsInline
      loop={photo.loop !== false}
      preload="metadata"
    />
  )
}
