import { ImageResponse } from "next/og"

export const alt = "Sagdi Formanov — building in public"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpengraphImage() {
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
            flexDirection: "column",
            fontSize: 78,
            fontWeight: 800,
            color: "#1f2328",
            letterSpacing: -2,
            lineHeight: 1.08,
          }}
        >
          <span>I build things,</span>
          <span>and write about it.</span>
        </div>
        <div style={{ fontSize: 34, color: "#57606a", marginTop: 34 }}>
          Sagdi Formanov · building in public
        </div>
      </div>
    ),
    { ...size }
  )
}
