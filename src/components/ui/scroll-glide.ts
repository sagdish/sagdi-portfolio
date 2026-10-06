/**
 * Horizontal scrolling helpers shared by the photo strip and the photo viewer —
 * both are native scroll-snap scrollers whose buttons move them frame by frame.
 */

const DURATION = 400

/**
 * The scrollLeft at which each child of `track` sits at the scroller's start
 * edge. Measured from the first child, so the scroller's own padding cancels out.
 */
export function childOffsets(track: HTMLElement): number[] {
  const items = Array.from(track.children) as HTMLElement[]
  const base = items[0]?.offsetLeft ?? 0
  return items.map((el) => el.offsetLeft - base)
}

/** Index of the offset closest to `x`. */
export function nearestIndex(offsets: number[], x: number): number {
  return offsets.reduce(
    (best, o, i) => (Math.abs(o - x) < Math.abs(offsets[best] - x) ? i : best),
    0
  )
}

/**
 * Scroll `el` to `left` with an ease-out glide. Returns a function that stops
 * it. Instant under reduced motion. `onEnd` runs once it stops, however it
 * stops: Safari doesn't always fire a scroll event for the last step, so
 * anything that follows the scroll position should re-read it there.
 *
 * Self-driven instead of scrollTo({behavior: "smooth"}), which is unreliable on
 * snap containers and can be turned off browser-wide. Snapping is switched off
 * while it runs: Chrome re-snaps every scrollLeft write, which pulls each small
 * step back to the frame it started from, so the strip never moves. It comes
 * back on when the glide ends — `left` is itself a snap point — or the moment
 * the user scrolls (the position stops matching the glide's last write).
 */
export function glideTo(
  el: HTMLElement,
  left: number,
  onEnd: () => void = () => {}
): () => void {
  const to = Math.max(0, Math.min(left, el.scrollWidth - el.clientWidth))
  const from = el.scrollLeft
  const dist = to - from
  if (Math.abs(dist) < 1) return () => {}
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.scrollLeft = to
    onEnd()
    return () => {}
  }

  let raf = 0
  let running = true
  let expected = from
  const t0 = performance.now()
  const stop = () => {
    if (!running) return
    running = false
    cancelAnimationFrame(raf)
    el.style.scrollSnapType = ""
    onEnd()
  }
  const step = (now: number) => {
    if (Math.abs(el.scrollLeft - expected) > 2) return stop()
    const t = Math.min(1, (now - t0) / DURATION)
    expected = from + dist * (1 - Math.pow(1 - t, 3))
    el.scrollLeft = expected
    if (t < 1) raf = requestAnimationFrame(step)
    else stop()
  }
  el.style.scrollSnapType = "none"
  raf = requestAnimationFrame(step)
  return stop
}
