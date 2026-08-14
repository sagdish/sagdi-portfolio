// Renders a JSON-LD structured-data block. `data` is a plain schema.org object
// (or a graph). Kept as a tiny server component so pages can drop in schemas.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
