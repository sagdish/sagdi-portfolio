import { notFound } from "next/navigation"

// Ensures unknown routes within a locale (e.g. `/ru/does-not-exist`)
// render the localized `not-found` page.
export default function CatchAllPage() {
  notFound()
}
