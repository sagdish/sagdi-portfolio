"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import clsx from "clsx"
import type { DottedMapProps } from "@/components/ui/dotted-map"

// Dynamically import the DottedMap so it doesn't run on the server
const DynamicDottedMap = dynamic(
  async () => {
    const mod = await import("@/components/ui/dotted-map")
    return mod.DottedMap
  },
  { ssr: false }
)

export function HeroMap({
  className,
  markers,
  responsive = true,
}: {
  className?: string
  markers?: DottedMapProps["markers"]
  /** When true (default), picks props by viewport; when false, uses fixed defaults. */
  responsive?: boolean
}) {
  const [isMdUp, setIsMdUp] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    if (!responsive) return
    const query = "(min-width: 768px)"
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      // Support both event callback and initial assignment
      setIsMdUp("matches" in e ? e.matches : (e as MediaQueryList).matches)
    }

    handler(mql)
    if (mql.addEventListener)
      mql.addEventListener("change", handler as EventListener)
    else
      mql.addListener(
        handler as (this: MediaQueryList, ev: MediaQueryListEvent) => void
      )
    return () => {
      if (mql.removeEventListener)
        mql.removeEventListener("change", handler as EventListener)
      else
        mql.removeListener(
          handler as (this: MediaQueryList, ev: MediaQueryListEvent) => void
        )
    }
  }, [responsive])

  // If not responsive, render immediately with fixed defaults
  if (!responsive) {
    const fixedProps = { dotRadius: 0.19, mapSamples: 6500 }
    return (
      <div className={clsx("relative h-full w-full", className)}>
        <DynamicDottedMap
          className="map-fade h-full w-full"
          markers={markers}
          {...fixedProps}
        />
      </div>
    )
  }

  // Responsive path: avoid hydration mismatches by rendering only on client after first effect
  if (isMdUp === null) return null

  const mapProps = isMdUp
    ? { dotRadius: 0.12, mapSamples: 7500 }
    : { dotRadius: 0.2, mapSamples: 5500 }

  return (
    <div className={clsx("relative h-full w-full", className)}>
      <DynamicDottedMap
        className="map-fade h-full w-full"
        markers={markers}
        {...mapProps}
      />
    </div>
  )
}
