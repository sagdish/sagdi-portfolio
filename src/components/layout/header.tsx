import { Navigation } from "./navigation"

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b">
      <Navigation />
    </header>
  )
}
