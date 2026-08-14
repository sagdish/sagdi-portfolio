import { ImageResponse } from "next/og"
import { routing } from "@/i18n/routing"

export const alt = "Sagdi Formanov — Product Manager"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0b1220 0%, #111827 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 88, fontWeight: 700, letterSpacing: -2 }}>
          Sagdi Formanov
        </div>
        <div style={{ fontSize: 44, marginTop: 16, color: "#4686EB" }}>
          Product Manager
        </div>
        <div style={{ fontSize: 30, marginTop: 28, color: "#9ca3af" }}>
          sagdi.com
        </div>
      </div>
    ),
    { ...size }
  )
}
