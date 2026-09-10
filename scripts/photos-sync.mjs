/**
 * Sync photography to Cloudflare R2: `npm run photos:sync [-- <set>...] [--prune]`
 *
 * Every folder in ./photos-src (gitignored) is a SET — a named group of photos
 * the site can ask for, e.g. photos-src/home/ → listPhotos("home"). Files
 * sitting loose in photos-src/ belong to no set and are ignored.
 *
 * Order within a set is by filename: camera names (20260710_191537.jpg) sort by
 * date on their own; a number prefix (010-dog.jpg) sorts ahead of them when you
 * want manual control. Direction and captions live in an optional set.json:
 *   { "order": "newest-first" | "oldest-first",       (default oldest-first)
 *     "items": { "<filename>": { "alt", "caption", "width", "height" } } }
 * width/height are only needed for videos the script can't measure (webm).
 *
 * Per image it uploads a strip-sized WebP (720px tall, what the carousel shows)
 * and the 3000px JPEG original, both named with a content hash so they can be
 * cached forever and skipped on later runs. Videos (mp4 / m4v / mov / webm)
 * upload as-is — no transcoding — with their display size read from the file
 * (mp4 family) or set.json. Each set gets photos/<set>/manifest.json, the file
 * lib/photos.ts reads. Reordering or captioning re-syncs in seconds: only the
 * manifest changes.
 *
 * --prune deletes bucket files that no longer come from a folder here. Scope is
 * the synced sets, or all of photos/ when syncing everything. Without it
 * nothing is ever deleted.
 *
 * Videos must be browser-playable as-is: H.264 in an mp4 plays everywhere,
 * HEVC (the iPhone default) does not play in Chrome or Firefox.
 *
 * One-time R2 setup:
 *   1. Cloudflare dashboard → R2 → create bucket (e.g. "sagdi-photos").
 *   2. Bucket → Settings → Public Development URL → Enable (or attach a custom
 *      domain) — that base URL, with https://, is PHOTOS_BASE_URL.
 *   3. R2 → Manage API tokens → Account API token, Object Read & Write on the
 *      bucket → R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY. R2_ACCOUNT_ID is the
 *      32-char hex in the bucket's S3 API line; R2_BUCKET is the bucket name.
 * All go in .env.local (this script loads it itself).
 */
import { readdir, readFile } from "node:fs/promises"
import { createHash } from "node:crypto"
import path from "node:path"
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3"
import sharp from "sharp"

const ROOT = path.join(import.meta.dirname, "..")
const SRC_DIR = path.join(ROOT, "photos-src")
const PIPELINE = "v1" // bump to re-encode and re-upload everything
const STRIP_HEIGHT = 720
const MAX_SIDE = 3000
const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".tif",
  ".tiff",
  ".heic",
])
const VIDEO_TYPES = {
  ".mp4": "video/mp4",
  ".m4v": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
}
const MP4_FAMILY = new Set([".mp4", ".m4v", ".mov"])
const IMMUTABLE = "public, max-age=31536000, immutable"

const isMedia = (f) => {
  const ext = path.extname(f).toLowerCase()
  return IMAGE_EXTENSIONS.has(ext) || ext in VIDEO_TYPES
}
const fail = (msg) => {
  console.error(msg)
  process.exit(1)
}

// Minimal .env.local loader — npm scripts don't get Next's env handling.
async function loadEnvLocal() {
  try {
    const text = await readFile(path.join(ROOT, ".env.local"), "utf8")
    for (const line of text.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
      if (m && !(m[1] in process.env)) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
      }
    }
  } catch {
    // No .env.local — rely on the ambient environment.
  }
}

await loadEnvLocal()

const missing = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
].filter((k) => !process.env[k])
if (missing.length) {
  fail(`Missing env: ${missing.join(", ")} (see header of this script)`)
}
if (!/^[0-9a-f]{32}$/.test(process.env.R2_ACCOUNT_ID)) {
  fail(
    "R2_ACCOUNT_ID must be the 32-character hex account id only — not the S3 URL."
  )
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})
const bucket = process.env.R2_BUCKET

/**
 * Display size of an MP4-family file (mp4 / m4v / mov), read from the video
 * track's `tkhd` box in moov/trak. tkhd holds the un-rotated size plus a
 * transform matrix; phones record portrait as landscape + 90° matrix, and
 * browsers honour the matrix, so a rotated track reports swapped dimensions.
 * Returns null if no video track is found.
 */
function mp4Dimensions(buf) {
  const boxes = function* (start, end) {
    let pos = start
    while (pos + 8 <= end) {
      let size = buf.readUInt32BE(pos)
      const type = buf.toString("latin1", pos + 4, pos + 8)
      let head = 8
      if (size === 1) {
        size = Number(buf.readBigUInt64BE(pos + 8))
        head = 16
      } else if (size === 0) {
        size = end - pos
      }
      if (size < head) return
      yield { type, body: pos + head, end: Math.min(pos + size, end) }
      pos += size
    }
  }
  const fixed = (at) => buf.readInt32BE(at) / 65536
  for (const moov of boxes(0, buf.length)) {
    if (moov.type !== "moov") continue
    for (const trak of boxes(moov.body, moov.end)) {
      if (trak.type !== "trak") continue
      for (const tkhd of boxes(trak.body, trak.end)) {
        if (tkhd.type !== "tkhd") continue
        const version = buf.readUInt8(tkhd.body)
        // version+flags, times/ids/duration, reserved+layer+group+volume+reserved
        const matrix = tkhd.body + 4 + (version === 1 ? 32 : 20) + 16
        const width = fixed(matrix + 36)
        const height = fixed(matrix + 40)
        if (!(width > 0 && height > 0)) continue // audio / other track
        const a = fixed(matrix)
        const d = fixed(matrix + 16)
        const rotated = a === 0 && d === 0
        return {
          width: Math.round(rotated ? height : width),
          height: Math.round(rotated ? width : height),
        }
      }
    }
  }
  return null
}

// ── Which sets ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const prune = args.includes("--prune")
const wanted = args.filter((a) => !a.startsWith("--"))

let entries
try {
  entries = await readdir(SRC_DIR, { withFileTypes: true })
} catch {
  fail(`No ${SRC_DIR} folder — create it, with one folder per set inside.`)
}
const allSets = entries
  .filter((e) => e.isDirectory() && !e.name.startsWith("."))
  .map((e) => e.name)
  .sort()
const loose = entries.filter((e) => e.isFile() && isMedia(e.name))
if (loose.length) {
  console.warn(
    `! ignoring ${loose.length} file(s) loose in photos-src/ — move them into a set folder, e.g. photos-src/home/`
  )
}
for (const w of wanted) {
  if (!allSets.includes(w)) fail(`No set folder photos-src/${w}/`)
}
const sets = wanted.length ? wanted : allSets
if (!sets.length) fail("No set folders in photos-src/ (e.g. photos-src/home/).")

// ── What the bucket already holds ─────────────────────────────────────────────
const existing = new Set()
let token
do {
  const page = await s3.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: "photos/",
      ContinuationToken: token,
    })
  )
  for (const o of page.Contents ?? []) existing.add(o.Key)
  token = page.IsTruncated ? page.NextContinuationToken : undefined
} while (token)

const keep = new Set()
async function put(key, body, contentType, cacheControl, note) {
  keep.add(key)
  if (existing.has(key)) {
    console.log(`= ${key} (in bucket)`)
    return
  }
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: cacheControl,
    })
  )
  console.log(`↑ ${key}${note ? ` (${note})` : ""}`)
}

// ── Sync each set ─────────────────────────────────────────────────────────────
for (const set of sets) {
  const dir = path.join(SRC_DIR, set)
  let cfg = {}
  try {
    cfg = JSON.parse(await readFile(path.join(dir, "set.json"), "utf8"))
  } catch (e) {
    if (e.code !== "ENOENT")
      fail(`photos-src/${set}/set.json is not valid JSON`)
  }
  const order = cfg.order ?? "oldest-first"
  if (!["oldest-first", "newest-first"].includes(order)) {
    fail(
      `photos-src/${set}/set.json: "order" must be "oldest-first" or "newest-first"`
    )
  }
  const items = cfg.items ?? {}

  const files = (await readdir(dir)).filter(isMedia).sort()
  if (order === "newest-first") files.reverse()
  if (!files.length) fail(`photos-src/${set}/ has no images or videos.`)
  for (const name of Object.keys(items)) {
    if (!files.includes(name)) {
      console.warn(
        `! ${set}/set.json lists "${name}" but there is no such file`
      )
    }
  }

  console.log(`\n${set} (${files.length} files, ${order})`)
  const photos = []
  for (const file of files) {
    const ext = path.extname(file).toLowerCase()
    const stem = path
      .basename(file, path.extname(file))
      .replace(/[^A-Za-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
    const src = await readFile(path.join(dir, file))
    const hash = createHash("sha1")
      .update(PIPELINE)
      .update(src)
      .digest("hex")
      .slice(0, 8)
    const base = `photos/${set}/${stem}-${hash}`
    const alt =
      items[file]?.alt ?? stem.replace(/^[\d-_ ]+/, "").replace(/[-_]+/g, " ")
    const caption = items[file]?.caption

    if (ext in VIDEO_TYPES) {
      const key = `${base}${ext}`
      const fromCfg =
        items[file]?.width > 0 && items[file]?.height > 0
          ? { width: items[file].width, height: items[file].height }
          : null
      const dims = fromCfg ?? (MP4_FAMILY.has(ext) ? mp4Dimensions(src) : null)
      if (!dims) {
        fail(
          `Can't read the size of ${set}/${file} — add "width" and "height" for it under "items" in photos-src/${set}/set.json.`
        )
      }
      await put(
        key,
        src,
        VIDEO_TYPES[ext],
        IMMUTABLE,
        `video ${dims.width}×${dims.height}, ${(src.length / 1024 / 1024).toFixed(1)}MB`
      )
      photos.push({ key, type: "video", ...dims, alt, caption })
      continue
    }

    const strip = await sharp(src)
      .rotate()
      .resize({ height: STRIP_HEIGHT, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer({ resolveWithObject: true })
    const full = await sharp(src)
      .rotate()
      .resize(MAX_SIDE, MAX_SIDE, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer({ resolveWithObject: true })
    const blur = await sharp(strip.data)
      .resize(12)
      .jpeg({ quality: 40 })
      .toBuffer()

    const stripKey = `${base}.webp`
    const fullKey = `${base}.jpg`
    await put(
      stripKey,
      strip.data,
      "image/webp",
      IMMUTABLE,
      `${strip.info.width}×${strip.info.height}, ${(strip.data.length / 1024).toFixed(0)}kB`
    )
    await put(
      fullKey,
      full.data,
      "image/jpeg",
      IMMUTABLE,
      `${full.info.width}×${full.info.height}, ${(full.data.length / 1024).toFixed(0)}kB`
    )
    photos.push({
      key: stripKey,
      width: strip.info.width,
      height: strip.info.height,
      alt,
      caption,
      blurDataURL: `data:image/jpeg;base64,${blur.toString("base64")}`,
      full: { key: fullKey, width: full.info.width, height: full.info.height },
    })
  }

  const manifestKey = `photos/${set}/manifest.json`
  keep.add(manifestKey)
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: manifestKey,
      Body: JSON.stringify({ photos }, null, 2),
      ContentType: "application/json",
      CacheControl: "public, max-age=300",
    })
  )
  console.log(
    `↑ ${manifestKey} (${photos.length} items) — live within ~1h (ISR revalidate)`
  )
}

// ── Prune ─────────────────────────────────────────────────────────────────────
if (prune) {
  const scope = wanted.length ? sets.map((s) => `photos/${s}/`) : ["photos/"]
  const stale = [...existing].filter(
    (k) => scope.some((p) => k.startsWith(p)) && !keep.has(k)
  )
  for (let i = 0; i < stale.length; i += 1000) {
    const chunk = stale.slice(i, i + 1000)
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: chunk.map((Key) => ({ Key })), Quiet: true },
      })
    )
    for (const k of chunk) console.log(`✕ ${k}`)
  }
  console.log(`\npruned ${stale.length} file(s)`)
}
