import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

// iPhone home-screen icon: the SF logo (public/logo.png), full-bleed. The logo's
// corners are transparent and iOS turns transparency black, so the square behind it
// is the logo's own blue. iOS applies its own rounded mask.
export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default async function AppleIcon() {
  const logo = await readFile(join(process.cwd(), "public/logo.png"))
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#288af3",
        }}
      >
        <img
          src={`data:image/png;base64,${logo.toString("base64")}`}
          width={size.width}
          height={size.height}
          alt=""
        />
      </div>
    ),
    { ...size }
  )
}
