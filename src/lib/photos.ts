import { SAMPLE_PHOTOS } from "@/content/sample-photos"

/**
 * Photography data layer, storage-agnostic — same safe-fallback shape as
 * lib/writing.ts: fetch the real source when PHOTOS_BASE_URL is configured,
 * otherwise fall back to bundled sample frames so the page always renders
 * (`sample` flags placeholder content for the UI).
 *
 * The source is any static host (currently a public Cloudflare R2 bucket).
 * Photos are grouped in named SETS — one folder each in photos-src/, synced by
 * scripts/photos-sync.mjs to photos/<set>/manifest.json:
 *   { "photos": [{ "key", "type?", "width", "height", "alt", "caption?",
 *                  "blurDataURL?", "full?": { "key", "width", "height" } }] }
 * `key` is the strip-sized WebP the carousel shows, served straight from the
 * bucket (no Next optimizer). `type` is "image" (default when absent) or
 * "video" — a muted clip the carousel autoplays in place. `full` points at the
 * 3000px original, for any later full-size use.
 */
export type Photo = {
  src: string
  type: "image" | "video"
  width: number
  height: number
  alt: string
  caption?: string
  blurDataURL?: string
  full?: { src: string; width: number; height: number }
}

type ManifestPhoto = Partial<Omit<Photo, "src" | "full">> & {
  key?: string
  full?: { key?: string; width?: number; height?: number }
}

export async function listPhotos(set = "home"): Promise<{
  photos: Photo[]
  sample: boolean
}> {
  const base = process.env.PHOTOS_BASE_URL?.replace(/\/+$/, "")
  if (base) {
    try {
      const res = await fetch(`${base}/photos/${set}/manifest.json`, {
        next: { revalidate: 3600 },
      })
      if (res.ok) {
        const manifest = (await res.json()) as { photos?: ManifestPhoto[] }
        const photos = (manifest.photos ?? []).flatMap((p): Photo[] =>
          p.key && p.width && p.height
            ? [
                {
                  src: `${base}/${p.key}`,
                  type: p.type === "video" ? "video" : "image",
                  width: p.width,
                  height: p.height,
                  alt: p.alt ?? "",
                  caption: p.caption,
                  blurDataURL: p.blurDataURL,
                  full:
                    p.full?.key && p.full.width && p.full.height
                      ? {
                          src: `${base}/${p.full.key}`,
                          width: p.full.width,
                          height: p.full.height,
                        }
                      : undefined,
                },
              ]
            : []
        )
        if (photos.length) return { photos, sample: false }
      }
    } catch {
      // Bucket unreachable / bad manifest — fall through to samples.
    }
  }
  return { photos: SAMPLE_PHOTOS, sample: true }
}
