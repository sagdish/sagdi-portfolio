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
 *                  "loop?", "blurDataURL?", "full?": { "key", "width", "height" },
 *                  "views?": [{ "key", "width", "height" }] }] }
 * `key` is the strip-sized WebP the carousel shows, served straight from the
 * bucket (no Next optimizer). `type` is "image" (default when absent) or
 * "video" — a muted clip the carousel autoplays in place; `loop: false` plays
 * it once. `views` are the full-view sizes, smallest first: the photo viewer
 * loads only the one that fits the screen. `full` points at the 3000px
 * original, for any later full-size use.
 */
export type PhotoFile = { src: string; width: number; height: number }

export type Photo = PhotoFile & {
  type: "image" | "video"
  alt: string
  caption?: string
  /** Videos only: false plays the clip once. Loops when absent. */
  loop?: boolean
  blurDataURL?: string
  full?: PhotoFile
  views?: PhotoFile[]
}

type ManifestFile = { key?: string; width?: number; height?: number }
type ManifestPhoto = Partial<Omit<Photo, "src" | "full" | "views">> &
  ManifestFile & { full?: ManifestFile; views?: ManifestFile[] }

export async function listPhotos(set = "home"): Promise<{
  photos: Photo[]
  sample: boolean
}> {
  const base = process.env.PHOTOS_BASE_URL?.replace(/\/+$/, "")
  if (base) {
    try {
      const res = await fetch(`${base}/photos/${set}/manifest.json`, {
        // 60s, not an hour: publishing deletes the files a photo no longer
        // needs, so a page holding an older list must go stale quickly. The
        // carousel drops any frame whose file is already gone.
        next: { revalidate: 60 },
      })
      if (res.ok) {
        const manifest = (await res.json()) as { photos?: ManifestPhoto[] }
        const file = (f?: ManifestFile): PhotoFile | undefined =>
          f?.key && f.width && f.height
            ? { src: `${base}/${f.key}`, width: f.width, height: f.height }
            : undefined
        const photos = (manifest.photos ?? []).flatMap((p): Photo[] => {
          const strip = file(p)
          if (!strip) return []
          const views = (p.views ?? []).flatMap((v) => file(v) ?? [])
          return [
            {
              ...strip,
              type: p.type === "video" ? "video" : "image",
              alt: p.alt ?? "",
              caption: p.caption,
              loop: p.loop,
              blurDataURL: p.blurDataURL,
              full: file(p.full),
              views: views.length ? views : undefined,
            },
          ]
        })
        if (photos.length) return { photos, sample: false }
      }
    } catch {
      // Bucket unreachable / bad manifest — fall through to samples.
    }
  }
  return { photos: SAMPLE_PHOTOS, sample: true }
}
