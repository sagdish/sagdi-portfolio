import { ImageResponse } from "next/og"
import { getTranslations } from "next-intl/server"
import { routing } from "@/i18n/routing"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// One preview image per language; the text comes from that language's messages.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const [meta, home] = await Promise.all([
    getTranslations({ locale, namespace: "meta" }),
    getTranslations({ locale, namespace: "home" }),
  ])
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "84px",
          background: "#fbfaf8",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 44,
          }}
        >
          <div
            style={{
              width: 66,
              height: 66,
              background: "#4686eb",
              borderRadius: 15,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            S
          </div>
          <div style={{ fontSize: 30, color: "#57606a" }}>sagdi.com</div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 62,
            fontWeight: 800,
            color: "#1f2328",
            letterSpacing: -2,
            lineHeight: 1.08,
          }}
        >
          {home("titleLine1")}
        </div>
        <div style={{ fontSize: 34, color: "#57606a", marginTop: 34 }}>
          {meta("default.title")}
        </div>
      </div>
    ),
    { ...size }
  )
}
