import { ImageResponse } from "next/og"

// Branded apple-touch-icon (replaces the old marketing PNG): the [S] mark on the
// brand blue. Full-bleed square — iOS applies its own rounded mask.
export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#4686eb",
          color: "#ffffff",
          fontSize: 116,
          fontWeight: 700,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
      >
        S
      </div>
    ),
    { ...size }
  )
}
