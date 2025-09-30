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
}: {
  className?: string
  markers?: DottedMapProps["markers"]
}) {
  const [isMdUp, setIsMdUp] = React.useState<boolean | null>(null)

  React.useEffect(() => {
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
  }, [])

  // Avoid hydration mismatches by rendering only on client after first effect
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
