import { Navigation } from "./navigation"

export function Header() {
  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2">
        <div className="border shadow-sm bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-xl">
          <Navigation />
        </div>
      </div>
    </header>
  )
}
