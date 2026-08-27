import { SAMPLE_PHOTOS } from "@/content/sample-photos"

/**
 * Photography data layer, storage-agnostic — same safe-fallback shape as
 * lib/writing.ts: fetch the real source when PHOTOS_BASE_URL is configured,
 * otherwise fall back to bundled sample frames so the page always renders
 * (`sample` flags placeholder content for the UI).
 *
 * The source is any static host (currently a public Cloudflare R2 bucket)
 * serving the images plus a manifest.json written by scripts/photos-sync.mjs:
 *   { "photos": [{ "key", "width", "height", "alt", "caption?", "blurDataURL?" }] }
 */
export type Photo = {
  src: string
  width: number
  height: number
  alt: string
  caption?: string
  blurDataURL?: string
}

type ManifestPhoto = Partial<Omit<Photo, "src">> & { key?: string }

export async function listPhotos(): Promise<{
  photos: Photo[]
  sample: boolean
}> {
  const base = process.env.PHOTOS_BASE_URL?.replace(/\/+$/, "")
  if (base) {
    try {
      const res = await fetch(`${base}/manifest.json`, {
        next: { revalidate: 3600 },
      })
      if (res.ok) {
        const manifest = (await res.json()) as { photos?: ManifestPhoto[] }
        const photos = (manifest.photos ?? []).flatMap((p): Photo[] =>
          p.key && p.width && p.height
            ? [
                {
                  src: `${base}/${p.key}`,
                  width: p.width,
                  height: p.height,
                  alt: p.alt ?? "",
                  caption: p.caption,
                  blurDataURL: p.blurDataURL,
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
