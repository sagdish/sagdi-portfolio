import { notFound } from "next/navigation"

// Catch-all: any URL that matches no real route renders the [locale]
// not-found inside the themed app shell, instead of falling through to the
// bare root 404 (which sits outside the ThemeProvider).
export default function CatchAllNotFound() {
  notFound()
}
