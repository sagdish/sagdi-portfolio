// The real root layout (with <html> / <body>) lives in `[locale]/layout.tsx`.
// This pass-through root layout only exists so that the global `not-found.tsx`
// (for requests that never reach the `[locale]` segment) has a parent layout.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
