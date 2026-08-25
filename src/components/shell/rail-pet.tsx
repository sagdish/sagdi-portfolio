"use client"

import * as React from "react"

/* ─────────────────────────────────────────────────────────────────────────────
   Sagdi-OS desk pet — a pixel cat that lives in the empty desktop-rail column.

   It starts as a cardboard box with a "don't open" dare. Press it and the cat
   bursts out; the box stays as its bed. From then on the cat sleeps, wakes,
   wanders, follows your cursor and tracks it with its eyes, grooms (licks a paw),
   rains hearts when petted, and once in a while a dog bolts past and it leaps.
   When your cursor leaves the rail it hides at the right edge (just its ears
   peeking); it comes back when you return. Idle too long and it climbs back into
   the box, which closes.

   One <canvas> fills the rail's empty column (a low-res backing store, CSS-scaled
   crisp — `image-rendering:pixelated`). Everything is drawn by hand from pixel
   grids; colors come from theme-aware CSS vars on `.rail-pet`, so light/dark and
   the accent just work. Desktop-only for free — it lives inside `.rail`, which is
   `display:none` below 880px. Respects prefers-reduced-motion (holds still) and
   pauses when the tab is hidden.

   Grid legend:  '.' transparent · k outline · f fur · s shade · p pink
   (eyes are drawn in code so they can track the cursor and blink.)
   ───────────────────────────────────────────────────────────────────────────── */

const SCALE = 4
const CAT_W = 16
const CAT_H = 16
const BOX_H = 9
const FLOORPAD = 4 // lift the whole scene off the footer for breathing room
const AREA2_FROM = 0.6 // Area 2 (the "active" zone) is the bottom 40% of the column

// Sitting cat, eyes blank (the two eyes are painted separately so they can move).
const SIT: readonly string[] = [
  "...kk......kk...",
  "..kfpk....kpfk..",
  "..kfppk..kppfk..",
  ".kffffffffffffk.",
  ".kffffffffffffk.",
  ".kffffffffffffk.",
  ".kffffffffffffk.",
  ".kffffffffffffk.",
  ".kfffffppfffffk.",
  "..kffffffffffk..",
  "...kffffffffk...",
  "...kfssssssfk...",
  "...kfssssssfk...",
  "...kfssssssfk...",
  "...kkff..ffkk...",
  "................",
]

const HEART: readonly string[] = [".p.p.", "ppppp", "ppppp", ".ppp.", "..p.."]
const ZED: readonly string[] = ["zzz", "..z", ".z.", "zzz"]

// The dog — bolts across (facing right; mirrored when it runs left). Two frames.
const DOG_W = 16
const DOG_H = 9
const DOG_A: readonly string[] = [
  "................",
  "...........kk...",
  "..kk......kffk..",
  ".kkkkkkkkkkkkfk.",
  ".kffffffffffffsk",
  ".kffffffffffffk.",
  ".kffffffffffffk.",
  "..k..kk..kk..k..",
  "..k..k....k..k..",
]
const DOG_B: readonly string[] = [
  "................",
  "...........kk...",
  "..kk......kffk..",
  ".kkkkkkkkkkkkfk.",
  ".kffffffffffffsk",
  ".kffffffffffffk.",
  ".kffffffffffffk.",
  "...kk..kk..kk...",
  "...k....k...k...",
]

// The box — a brown cardboard carton. Closed (its bed / sleep) and open; split so
// the cat can sit "inside" (BOX_BACK behind the cat, BOX_FRONT in front).
// b = kraft cardboard, d = shade / tape seam, k = outline.
const BOX_CLOSED: readonly string[] = [
  "................",
  "................",
  "..kkkkkkkkkkkk..",
  "..kbbbbddbbbbk..",
  "..kbbbbbbbbbbk..",
  "..kbbbbbbbbbbk..",
  "..kbddddddddbk..",
  "..kbbbbbbbbbbk..",
  "..kkkkkkkkkkkk..",
]
const BOX_BACK: readonly string[] = [
  ".kk........kk...",
  ".kbk......kbk...",
  "..kkkkkkkkkkkk..",
  "..kddddddddddk..",
  "..kddddddddddk..",
  "..k..........k..",
  "..k..........k..",
  "..k..........k..",
  "................",
]
const BOX_FRONT: readonly string[] = [
  "................",
  "................",
  "................",
  "................",
  "................",
  "..kbbbbbbbbbbk..",
  "..kbddddddddbk..",
  "..kbbbbbbbbbbk..",
  "..kkkkkkkkkkkk..",
]
// Complete open box (the bed) drawn behind the cat while it roams.
const BOX_OPEN: readonly string[] = [
  ".kk........kk...",
  ".kbk......kbk...",
  "..kkkkkkkkkkkk..",
  "..kddddddddddk..",
  "..kddddddddddk..",
  "..kbbbbbbbbbbk..",
  "..kbddddddddbk..",
  "..kbbbbbbbbbbk..",
  "..kkkkkkkkkkkk..",
]

// Eye sockets in SIT (top-left of each 2×2 eye).
const EYES = [
  { x: 4, y: 6 },
  { x: 10, y: 6 },
] as const

// The escalating dare on the closed box (shown until it's opened the first time).
const DARE = ["don't open", "seriously, don't", "last warning…"]

type Palette = Record<string, string>

function readPalette(el: HTMLElement): Palette {
  const cs = getComputedStyle(el)
  const v = (name: string, fallback: string) =>
    cs.getPropertyValue(name).trim() || fallback
  return {
    k: v("--pet-ink", "#1f2328"),
    f: v("--pet-fur", "#3b424b"),
    s: v("--pet-fur-2", "#565e69"),
    p: v("--pet-pink", "#e58f9e"),
    e: v("--pet-eye", "#4686eb"),
    z: v("--faint", "#7d8590"),
    b: v("--pet-box", "#c79355"),
    d: v("--pet-box-2", "#9a6c3a"),
  }
}

const rand = (min: number, max: number) => min + Math.random() * (max - min)
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)

type State =
  | "boxed"
  | "hatch"
  | "idle"
  | "walk"
  | "lick"
  | "startle"
  | "hide"
  | "tobed"

interface Heart {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
}
interface Zed {
  x: number
  y: number
  life: number
}

export function RailPet() {
  const wrapRef = React.useRef<HTMLButtonElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [revealed, setRevealed] = React.useState(false)
  const [dare, setDare] = React.useState(-1) // -1 = box only, no label yet
  const revealedRef = React.useRef(false)
  const dareRef = React.useRef(-1)

  React.useEffect(() => {
    const wrap = wrapRef.current
    const cv = canvasRef.current
    if (!wrap || !cv) return
    const ctx = cv.getContext("2d")
    if (!ctx) return
    ctx.imageSmoothingEnabled = false
    const rail = wrap.closest(".rail") as HTMLElement | null

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    let pal = readPalette(wrap)

    // ── backing store sized to the column, in logical pixels ──
    let bw = 24
    let bh = 24
    let petRect = wrap.getBoundingClientRect()
    let railRect = (rail ?? wrap).getBoundingClientRect()
    const measure = () => {
      petRect = wrap.getBoundingClientRect()
      railRect = (rail ?? wrap).getBoundingClientRect()
    }
    const resize = () => {
      measure()
      bw = Math.max(24, Math.floor(petRect.width / SCALE))
      bh = Math.max(24, Math.floor(petRect.height / SCALE))
      cv.width = bw
      cv.height = bh
      cv.style.width = `${petRect.width}px`
      cv.style.height = `${petRect.height}px`
      ctx.imageSmoothingEnabled = false
      cat.boxX = 0 // box near the left edge; the cat hides off the right edge
      cat.floorY = bh - CAT_H - FLOORPAD
      cat.x = clamp(cat.x, cat.boxX, bw - CAT_W)
    }

    // ── cat + particles ──
    const cat = {
      x: 20,
      boxX: 20,
      floorY: 8,
      state: "boxed" as State,
      target: 20,
      look: { x: 0, y: 0 },
      bobT: 0,
      stateT: 0, // ms in the current timed state (hatch / tobed)
      blinkT: -9999,
      nextBlink: 0,
      lickT: 0,
      startleT: 0,
      nextAction: 0,
      lastActive: -9999,
      leftRail: -9999, // when the cursor last left the rail (or -9999 = inside)
    }
    const hearts: Heart[] = []
    const zeds: Zed[] = []
    let lastZ = -9999
    let boxedAt = -9999 // when it last fell asleep (z's only run ~5s after)
    let shakeUntil = 0 // the shut box shudders briefly on each dare tap
    const dog = { active: false, x: 0, dir: 1 }
    let nextDog = performance.now() + rand(24000, 44000)
    const spawnDog = () => {
      if (dog.active || cat.state === "boxed") return
      dog.dir = Math.random() < 0.5 ? 1 : -1
      dog.x = dog.dir > 0 ? -DOG_W - 2 : bw + 2
      dog.active = true
    }
    const ptr = { x: 0, y: 0, inRail: false }

    // ── input ──
    const onMove = (e: PointerEvent) => {
      ptr.x = (e.clientX - petRect.left) / SCALE
      ptr.y = (e.clientY - petRect.top) / SCALE
      ptr.inRail =
        e.clientX >= railRect.left &&
        e.clientX <= railRect.right &&
        e.clientY >= railRect.top &&
        e.clientY <= railRect.bottom
      // Moving the cursor within Area 2 keeps it awake (a still cursor does not).
      if (ptr.inRail && ptr.y > bh * AREA2_FROM) {
        cat.lastActive = performance.now()
      }
    }
    const pet = () => {
      const now = performance.now()
      cat.nextAction = now + rand(700, 1500)
      if (!reduced) {
        const cx = cat.x + CAT_W / 2 - 2
        const top = cat.floorY - 1
        for (let i = 0; i < 3; i++) {
          hearts.push({
            x: cx + (i - 1) * 5 + (Math.random() - 0.5) * 2,
            y: top - Math.random() * 4,
            vx: (i - 1) * 3.5 + (Math.random() - 0.5) * 2,
            vy: -9 - Math.random() * 5,
            life: 0,
            max: 820 + Math.random() * 380,
          })
        }
      }
    }
    const hatch = () => {
      cat.state = "hatch"
      cat.stateT = 0
      cat.x = cat.boxX
    }

    const onClick = (e: MouseEvent) => {
      if (cat.state === "boxed") {
        // Only the box itself wakes/opens it — clicking the empty rail does nothing.
        const lx = (e.clientX - petRect.left) / SCALE
        const ly = (e.clientY - petRect.top) / SCALE
        const boxOy = cat.floorY + (CAT_H - BOX_H)
        const onBox =
          lx >= cat.boxX &&
          lx <= cat.boxX + CAT_W &&
          ly >= boxOy &&
          ly <= boxOy + BOX_H + 1
        if (!onBox) return
        if (!revealedRef.current) {
          // Each tap escalates the dare; the box only opens after the last one.
          if (dareRef.current < DARE.length - 1) {
            dareRef.current += 1
            setDare(dareRef.current)
            shakeUntil = performance.now() + 240
            return
          }
          revealedRef.current = true
          setRevealed(true)
        }
        hatch()
      } else {
        pet()
      }
    }
    const onDbl = () => spawnDog() // double-click summons the dog chase
    document.addEventListener("pointermove", onMove)
    wrap.addEventListener("click", onClick)
    wrap.addEventListener("dblclick", onDbl)

    const mo = new MutationObserver(() => {
      pal = readPalette(wrap)
    })
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    })
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    window.addEventListener("scroll", measure, true)
    window.addEventListener("resize", measure)
    resize()
    cat.x = cat.boxX
    cat.target = cat.boxX

    const onVis = () => {
      if (document.hidden && cat.state !== "boxed") cat.state = "tobed"
    }
    document.addEventListener("visibilitychange", onVis)

    // ── drawing ──
    const stamp = (
      frame: readonly string[],
      ox: number,
      oy: number,
      colors: Palette,
      mirror = false
    ) => {
      for (let r = 0; r < frame.length; r++) {
        const row = frame[r]
        const w = row.length
        for (let c = 0; c < w; c++) {
          const col = colors[row[c]]
          if (!col) continue
          ctx.fillStyle = col
          ctx.fillRect(ox + (mirror ? w - 1 - c : c), oy + r, 1, 1)
        }
      }
    }
    const drawEyes = (
      ox: number,
      oy: number,
      look: { x: number; y: number },
      closed: boolean
    ) => {
      if (closed) {
        ctx.fillStyle = pal.k
        for (const e of EYES) ctx.fillRect(ox + e.x, oy + e.y + 1, 2, 1)
        return
      }
      for (let i = 0; i < EYES.length; i++) {
        const e = EYES[i]
        // blue eye (fixed), then a dark pupil that moves — reads as a real eye,
        // not a blank square. At rest the pupils sit toward the nose (focused).
        ctx.fillStyle = pal.e
        ctx.fillRect(ox + e.x, oy + e.y, 2, 2)
        const inner = i === 0 ? 1 : 0
        const px = e.x + (look.x === 0 ? inner : look.x < 0 ? 0 : 1)
        const py = e.y + (look.y > 0 ? 1 : 0)
        ctx.fillStyle = pal.k
        ctx.fillRect(ox + px, oy + py, 1, 1)
      }
    }

    // ── loop ──
    let raf = 0
    let alive = true // guards against a mid-flight frame rescheduling after cleanup
    let last = performance.now()
    const boxColors = () => ({ k: pal.k, b: pal.b, d: pal.d })
    const catColors = () => ({ k: pal.k, f: pal.f, s: pal.s, p: pal.p })

    const loop = (now: number) => {
      if (!alive) return
      const dt = Math.min(64, now - last)
      last = now
      ctx.clearRect(0, 0, bw, bh)
      const boxOy = cat.floorY + (CAT_H - BOX_H)

      // Pointer cursor only when hovering the box or the cat — not the empty rail.
      const overBox =
        ptr.x >= cat.boxX &&
        ptr.x <= cat.boxX + CAT_W &&
        ptr.y >= boxOy &&
        ptr.y <= boxOy + BOX_H + 1
      const overCat =
        ptr.x >= cat.x &&
        ptr.x <= cat.x + CAT_W &&
        ptr.y >= cat.floorY &&
        ptr.y <= cat.floorY + CAT_H
      wrap.style.cursor = overBox || overCat ? "pointer" : "default"

      // ── boxed: just the closed box (its bed) ──
      if (cat.state === "boxed") {
        const jx = now < shakeUntil ? Math.round(Math.sin(now / 22)) : 0
        stamp(BOX_CLOSED, cat.boxX + jx, boxOy, boxColors())
        // a few sleepy z's for ~3s after it dozes off, then it settles quietly
        if (!reduced && revealedRef.current && now - boxedAt < 3000) {
          if (zeds.length < 1 && now - lastZ > 1400) {
            zeds.push({ x: cat.boxX + 12, y: boxOy - 2, life: 0 })
            lastZ = now
          }
          for (let i = zeds.length - 1; i >= 0; i--) {
            const z = zeds[i]
            z.life += dt
            if (z.life > 1500) {
              zeds.splice(i, 1)
              continue
            }
            const a =
              z.life < 200
                ? z.life / 200
                : Math.max(0, 1 - (z.life - 200) / 1300)
            ctx.globalAlpha = a * 0.9
            stamp(
              ZED,
              Math.round(z.x + z.life / 240),
              Math.round(z.y - z.life / 95),
              { z: pal.z }
            )
            ctx.globalAlpha = 1
          }
        }
        raf = requestAnimationFrame(loop)
        return
      }

      if (reduced) {
        // Hold still: an open box with the cat sitting in it.
        stamp(BOX_BACK, cat.boxX, boxOy, boxColors())
        stamp(SIT, cat.boxX, cat.floorY, catColors())
        drawEyes(cat.boxX, cat.floorY, { x: 0, y: 0 }, false)
        stamp(BOX_FRONT, cat.boxX, boxOy, boxColors())
        raf = requestAnimationFrame(loop)
        return
      }

      const inRail = ptr.inRail
      if (inRail) {
        cat.leftRail = -9999
      } else if (cat.leftRail < 0) {
        cat.leftRail = now
      }

      // Moving the cursor in Area 2 (lower zone by the box) is the only thing
      // that keeps it awake — see onMove. It naps 10s after the last move while
      // the cursor lingers in Area 2, or 5s once the cursor is up in Area 1 or
      // out in the content.
      const inArea2 = inRail && ptr.y > bh * AREA2_FROM
      if (
        now - cat.lastActive > (inArea2 ? 10000 : 5000) &&
        (cat.state === "idle" ||
          cat.state === "walk" ||
          cat.state === "lick" ||
          cat.state === "hide")
      ) {
        cat.state = "tobed"
        cat.target = cat.boxX
      }

      // The dog cameo — rare timer while the cat's out (also on double-click).
      if (!dog.active && now > nextDog) {
        spawnDog()
        nextDog = now + rand(24000, 46000)
      }
      if (dog.active) {
        dog.x += ((dog.dir * 78) / 1000) * dt
        if (Math.abs(dog.x - cat.x) < 9 && cat.state !== "startle") {
          cat.state = "startle"
          cat.startleT = now
        }
        if (dog.x > bw + 4 || dog.x < -DOG_W - 4) dog.active = false
      }

      // Eye tracking — ease toward the cursor while it's in the rail.
      let tlx = 0
      let tly = 0
      if (inRail) {
        tlx = clamp(Math.round((ptr.x - (cat.x + 8)) / 7), -1, 1)
        tly = clamp(Math.round((ptr.y - (cat.floorY + 7)) / 7), -1, 1)
      }
      cat.look.x += (tlx - cat.look.x) * Math.min(1, dt / 110)
      cat.look.y += (tly - cat.look.y) * Math.min(1, dt / 110)
      const lookR = { x: Math.round(cat.look.x), y: Math.round(cat.look.y) }

      if (now > cat.nextBlink) {
        cat.blinkT = now
        cat.nextBlink = now + rand(2800, 6500)
      }

      let yoff = 0
      let closed = false
      let inBox = false // draw the box around the cat this frame
      let boxLid = false // opening: draw the shut box (cat still inside)

      switch (cat.state) {
        case "hatch": {
          cat.stateT += dt
          if (cat.stateT < 150) {
            boxLid = true // the shut box shudders, then bursts open
          } else {
            inBox = true
            const p = Math.min(1, (cat.stateT - 150) / 560)
            // a clean leap UP out of the box — never dips below it to the floor
            yoff = -Math.sin(p * Math.PI) * 11
            if (p >= 1) {
              cat.state = "idle"
              cat.nextAction = now + rand(500, 1200)
            }
          }
          break
        }
        case "idle": {
          if (cat.leftRail > 0 && now - cat.leftRail > 380) {
            cat.state = "hide"
            cat.target = bw + 4 // run fully off the right edge, out of view
          } else if (inRail && Math.abs(ptr.x - (cat.x + 8)) > 10) {
            cat.target = clamp(Math.round(ptr.x - 8), 0, bw - CAT_W)
            cat.state = "walk"
          } else if (now > cat.nextAction) {
            const roll = Math.random()
            if (roll < 0.5) {
              cat.target = clamp(
                Math.round(rand(2, bw - CAT_W - 2)),
                0,
                bw - CAT_W
              )
              cat.state = "walk"
            } else if (roll < 0.8) {
              cat.state = "lick"
              cat.lickT = now
            } else {
              cat.nextAction = now + rand(1400, 3200)
            }
          }
          break
        }
        case "walk": {
          const dir = cat.target > cat.x ? 1 : -1
          cat.x += ((dir * 30) / 1000) * dt
          cat.bobT += dt
          yoff = -(Math.floor(cat.bobT / 140) % 2)
          if (
            (dir > 0 && cat.x >= cat.target) ||
            (dir < 0 && cat.x <= cat.target)
          ) {
            cat.x = cat.target
            cat.state = "idle"
            cat.nextAction = now + rand(700, 1800)
          }
          if (inRail && Math.abs(ptr.x - (cat.x + 8)) > 10) {
            cat.target = clamp(Math.round(ptr.x - 8), 0, bw - CAT_W)
          }
          break
        }
        case "lick": {
          const seg = Math.floor((now - cat.lickT) / 220)
          if (seg >= 7) {
            cat.state = "idle"
            cat.nextAction = now + rand(900, 2200)
          } else {
            closed = true
            if (seg % 2 === 0) yoff = 1
          }
          break
        }
        case "startle": {
          const p = (now - cat.startleT) / 620
          if (p >= 1) {
            cat.state = "lick"
            cat.lickT = now
          } else {
            yoff = -Math.sin(p * Math.PI) * 13
          }
          break
        }
        case "hide": {
          const dir = cat.target > cat.x ? 1 : -1
          cat.x += ((dir * 42) / 1000) * dt // scurries a bit quicker
          cat.bobT += dt
          yoff = -(Math.floor(cat.bobT / 130) % 2)
          if (
            (dir > 0 && cat.x >= cat.target) ||
            (dir < 0 && cat.x <= cat.target)
          ) {
            cat.x = cat.target
          }
          if (inRail) {
            cat.state = "walk"
            cat.target = cat.boxX // come back toward its box, then resume
            cat.nextAction = now + 200
          }
          break
        }
        case "tobed": {
          const dir = cat.target > cat.x ? 1 : -1
          if (Math.abs(cat.x - cat.target) > 1) {
            cat.x += ((dir * 34) / 1000) * dt
            cat.bobT += dt
            yoff = -(Math.floor(cat.bobT / 140) % 2)
            cat.stateT = 0 // reset so the hop-in below starts clean on arrival
            if (inRail && now - cat.lastActive < 300) {
              cat.state = "idle" // changed our mind — someone's back
            }
          } else {
            cat.x = cat.target
            cat.stateT += dt
            if (cat.stateT < 480) {
              // a little hop up, then slide down into the open box
              inBox = true
              const p = cat.stateT / 480
              yoff = -Math.sin(p * Math.PI) * 8 + p * 14
            } else if (cat.stateT < 640) {
              boxLid = true // the lid closes over it
            } else {
              cat.state = "boxed"
              cat.stateT = 0
              boxedAt = now // start the ~5s sleep-z window
            }
          }
          break
        }
      }

      if (cat.state !== "startle" && now - cat.blinkT < 110) closed = true

      const ox = Math.round(cat.x)
      const oy = Math.round(cat.floorY + yoff)

      // the dog gallops along the floor, behind the leaping cat
      if (dog.active) {
        const dogFrame = Math.floor(now / 90) % 2 ? DOG_A : DOG_B
        stamp(
          dogFrame,
          Math.round(dog.x),
          cat.floorY + (CAT_H - DOG_H),
          catColors(),
          dog.dir < 0
        )
      }

      if (boxLid) {
        // opening: the shut box shudders side to side, cat still inside
        const jx = Math.round(Math.sin(now / 26))
        stamp(BOX_CLOSED, cat.boxX + jx, boxOy, boxColors())
      } else if (inBox) {
        // climbing in/out: box BACK behind, the cat clipped to the box so its
        // lower half tucks inside, and box FRONT painted on top of the cat.
        stamp(BOX_BACK, cat.boxX, boxOy, boxColors())
        ctx.save()
        ctx.beginPath()
        ctx.rect(0, 0, bw, boxOy + BOX_H)
        ctx.clip()
        stamp(SIT, ox, oy, catColors())
        drawEyes(ox, oy, lookR, closed)
        ctx.restore()
        stamp(BOX_FRONT, cat.boxX, boxOy, boxColors())
      } else {
        // roaming: the complete open box (bed) sits at home; the cat is in front.
        stamp(BOX_OPEN, cat.boxX, boxOy, boxColors())
        stamp(SIT, ox, oy, catColors())
        drawEyes(ox, oy, lookR, closed)

        if (
          cat.state === "lick" &&
          Math.floor((now - cat.lickT) / 220) % 2 === 0
        ) {
          ctx.fillStyle = pal.p
          ctx.fillRect(ox + 7, oy + 9, 2, 1)
          ctx.fillRect(ox + 7, oy + 10, 1, 1)
        }
        if (cat.state === "startle") {
          ctx.fillStyle = pal.e
          ctx.fillRect(ox + 8, oy - 5, 1, 2)
          ctx.fillRect(ox + 8, oy - 2, 1, 1)
        }
      }

      // hearts float up and fade
      for (let i = hearts.length - 1; i >= 0; i--) {
        const h = hearts[i]
        h.life += dt
        h.x += (h.vx * dt) / 1000
        h.y += (h.vy * dt) / 1000
        if (h.life >= h.max) {
          hearts.splice(i, 1)
          continue
        }
        ctx.globalAlpha = Math.max(0, 1 - h.life / h.max)
        stamp(HEART, Math.round(h.x), Math.round(h.y), { p: pal.p })
        ctx.globalAlpha = 1
      }

      raf = requestAnimationFrame(loop)
    }
    loop(performance.now()) // draw the first frame now (shows even in a hidden tab)

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      mo.disconnect()
      document.removeEventListener("pointermove", onMove)
      wrap.removeEventListener("click", onClick)
      wrap.removeEventListener("dblclick", onDbl)
      window.removeEventListener("scroll", measure, true)
      window.removeEventListener("resize", measure)
      document.removeEventListener("visibilitychange", onVis)
    }
  }, [])

  return (
    <button
      ref={wrapRef}
      type="button"
      className="rail-pet"
      aria-label={revealed ? "Pet the cat" : "Do not open"}
    >
      <canvas ref={canvasRef} className="pet-canvas" aria-hidden="true" />
      {!revealed && dare >= 0 && (
        <span className="pet-label" aria-hidden="true">
          {DARE[dare]}
        </span>
      )}
    </button>
  )
}
