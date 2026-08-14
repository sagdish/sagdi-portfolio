import Link from "next/link"

// Global fallback for requests that never reach the [locale] segment. The root
// layout is a pass-through, so this provides its own <html>/<body>.
export default function NotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fbfaf8",
          color: "#1f2328",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 12,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#4686eb",
              margin: 0,
            }}
          >
            404
          </p>
          <h1 style={{ fontSize: 28, margin: "10px 0 16px" }}>
            Page not found
          </h1>
          <Link href="/" style={{ color: "#3362ac" }}>
            Back to sagdi.com
          </Link>
        </div>
      </body>
    </html>
  )
}
