import Link from "next/link"
import { matrixType } from "@/app/fonts/matrix-type"

// Global fallback for requests that never reach the [locale] segment. The root
// layout is a pass-through, so this provides its own <html>/<body>. There is no
// ThemeProvider here, so a tiny pre-paint script applies the same stored choice
// next-themes uses (localStorage "theme": dark | light | system → OS setting).
const themeInit = `try{var t=localStorage.getItem("theme");if(t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`

export default function NotFound() {
  return (
    <html lang="en">
      <body className="nf-root">
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <style>{`
          .nf-root {
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fbfaf8;
            color: #1f2328;
            font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
            text-align: center;
          }
          .nf-root .code { color: #4686eb; font-size: 64px; font-weight: 700; line-height: 1; margin: 0; }
          .nf-root h1 { font-size: 34px; margin: 14px 0 0; }
          .nf-root p { color: #57606a; margin: 16px 0 0; }
          .nf-root a { color: #3362ac; display: inline-block; margin-top: 22px; }
          .dark .nf-root { background: #0a0d12; color: #e6edf3; }
          .dark .nf-root p { color: #9198a1; }
          .dark .nf-root a { color: #4686eb; }
        `}</style>
        <div>
          <p className={`code ${matrixType.className}`}>404</p>
          <h1 className={matrixType.className}>ROAD CLOSED HERE</h1>
          <p>This page took an exit that doesn&apos;t exist.</p>
          <Link href="/">Take me home →</Link>
        </div>
      </body>
    </html>
  )
}
