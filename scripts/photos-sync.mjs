/**
 * Publish photography to Cloudflare R2: `npm run photos:sync [-- <set>...]`
 *
 * Every folder in ./photos-src (gitignored) is a SET — a named group of photos
 * the site can ask for, e.g. photos-src/home/ → listPhotos("home") — except
 * the GROUPS (products/, writing/, world/), whose folders are the sets:
 * photos-src/products/reguself/ → listPhotos("products/reguself"). Files
 * sitting loose in photos-src/ or in a group belong to no set and are ignored.
 * Run one set with `npm run photos:sync -- products/reguself`.
 *
 * ORDER comes from photos-src/<set>/set.json, which the local photo manager
 * (photo-manager/, gitignored — start it and drag the photos around) writes:
 *   { "order": "newest-first" | "oldest-first",   direction for anything new
 *     "sequence": ["<file>", ...],                the exact order
 *     "items": { "<file>": { "alt", "caption", "loop", "width", "height" } } }
 * Files missing from "sequence" join at the newest end. With no "sequence" the
 * order is by file name, reversed for newest-first. width/height are only
 * needed for videos this script can't measure (webm). "loop": false makes a
 * video play once instead of looping; videos loop by default.
 *
 * Per image it uploads a strip-sized WebP (720px tall, what the carousel shows),
 * full-view WebPs (1600 and 2560px on the longest side, never bigger than the
 * photo — the photo viewer loads only the one that fits the screen) and the
 * 3000px JPEG original, all named with a content hash so they can be cached
 * forever. A photo published before the full-view sizes existed gets just
 * those added. Anything already in the bucket is reused from the published
 * manifest — not re-encoded — so a reorder finishes in seconds. Videos upload
 * as-is: H.264 in an mp4 plays everywhere, HEVC (the iPhone default) doesn't
 * play in Firefox or on some phones. Each set gets photos/<set>/manifest.json,
 * the file lib/photos.ts reads.
 *
 * A photo you deleted is deleted: once the new manifest is up, every file in
 * this set's folder that the manifest doesn't name is removed from the bucket
 * in the same run. One press, nothing left behind.
 *
 * That is safe because of two things on the site side: lib/photos.ts re-reads
 * the manifest every 60s, so a page can only be out of date for about a minute,
 * and the carousel drops a frame whose file 404s instead of showing a broken
 * image. Worst case a visitor briefly sees one photo fewer.
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
import { readdir, readFile, open, unlink } from "node:fs/promises"
import { unlinkSync } from "node:fs"
import path from "node:path"
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3"
import sharp from "sharp"
import {
  GROUPS,
  IMMUTABLE,
  MAX_SIDE,
  STRIP_HEIGHT,
  VIDEO_TYPES,
  altFromName,
  loops,
  cloudBase,
  extOf,
  isMedia,
  isVideo,
  listSets,
  missingFromSequence,
  mp4Info,
  orderFiles,
  playsEverywhere,
  unusableReason,
  viewSides,
} from "./photos-shared.mjs"

const ROOT = path.join(import.meta.dirname, "..")
const SRC_DIR = path.join(ROOT, "photos-src")
const LOCK = path.join(SRC_DIR, ".sync.lock")
const TRASH = path.join(SRC_DIR, ".trash")

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

// ── Arguments ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
// --prune and --cleanup used to be how deleting worked. It's automatic now.
const wanted = args.filter((a) => !a.startsWith("--"))

let entries
try {
  entries = await readdir(SRC_DIR, { withFileTypes: true })
} catch {
  fail(`No ${SRC_DIR} folder — create it, with one folder per set inside.`)
}
const allSets = await listSets(SRC_DIR)
const loose = entries.filter((e) => e.isFile() && isMedia(e.name))
if (loose.length) {
  console.warn(
    `! ignoring ${loose.length} file(s) loose in photos-src/ — move them into a set folder, e.g. photos-src/home/`
  )
}
for (const group of GROUPS) {
  let inGroup = []
  try {
    inGroup = await readdir(path.join(SRC_DIR, group))
  } catch {
    continue // No such group folder yet.
  }
  const strays = inGroup.filter(isMedia)
  if (strays.length) {
    console.warn(
      `! ignoring ${strays.length} file(s) loose in photos-src/${group}/ — a group holds sets, e.g. photos-src/${group}/<name>/`
    )
  }
}
for (const w of wanted) {
  if (GROUPS.includes(w)) {
    fail(
      `photos-src/${w}/ is a group of sets, not a set — name one, e.g. ${w}/<name>`
    )
  }
  if (!allSets.includes(w)) fail(`No set folder photos-src/${w}/`)
}
const sets = wanted.length ? wanted : allSets
if (!sets.length) fail("No set folders in photos-src/ (e.g. photos-src/home/).")

// ── One run at a time ─────────────────────────────────────────────────────────
// The photo manager publishes by running this script, so a Publish and a
// terminal run could otherwise upload over each other.
async function lock() {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const fh = await open(LOCK, "wx")
      await fh.writeFile(JSON.stringify({ pid: process.pid, at: Date.now() }))
      await fh.close()
      return
    } catch (e) {
      if (e.code !== "EEXIST") throw e
      let held = null
      try {
        held = JSON.parse(await readFile(LOCK, "utf8"))
      } catch {
        // Unreadable lock — treat it as stale.
      }
      const alive = (() => {
        try {
          process.kill(held.pid, 0)
          return true
        } catch {
          return false
        }
      })()
      if (held?.pid && alive && Date.now() - held.at < 6 * 3600_000) {
        fail(
          `Another photos sync is running (pid ${held.pid}). Wait for it, or delete ${LOCK} if it crashed.`
        )
      }
      await unlink(LOCK).catch(() => {})
    }
  }
  fail(`Couldn't take the lock at ${LOCK}`)
}
const unlock = () => unlink(LOCK).catch(() => {})

await lock()
// Also drop the lock when the run dies early (a fail(), Ctrl-C).
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(signal, () => process.exit(130))
}
process.on("exit", () => {
  try {
    unlinkSync(LOCK)
  } catch {
    // Already gone.
  }
})

try {
  await runSync()
} finally {
  await unlock()
}

// ── Bucket helpers ────────────────────────────────────────────────────────────
async function listKeys(prefix) {
  const keys = new Map()
  let token
  do {
    const page = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: token,
      })
    )
    for (const o of page.Contents ?? []) keys.set(o.Key, o)
    token = page.IsTruncated ? page.NextContinuationToken : undefined
  } while (token)
  return keys
}

async function getJson(key) {
  try {
    const res = await s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: key })
    )
    return JSON.parse(await res.Body.transformToString())
  } catch {
    return null
  }
}

// ── Publish ───────────────────────────────────────────────────────────────────
async function runSync() {
  const existing = await listKeys("photos/")

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

    const inFolder = await readdir(dir)
    for (const name of inFolder) {
      const why = unusableReason(name)
      if (why) console.warn(`! skipping ${set}/${name}: ${why}`)
    }
    const media = inFolder.filter(isMedia)
    if (!media.length) {
      // A set made with "New set" stays empty until photos go in. Publishing
      // everything skips it; naming it fails, as publishing nothing would
      // delete whatever it had online.
      if (!wanted.length) {
        console.log(`\n${set}: no photos yet, skipped`)
        continue
      }
      fail(`photos-src/${set}/ has no images or videos.`)
    }
    const files = orderFiles(media, { ...cfg, order })
    for (const name of missingFromSequence(media, cfg)) {
      console.warn(
        `! ${set}/set.json lists "${name}" but there is no such file`
      )
    }
    let inTrash = []
    try {
      inTrash = await readdir(path.join(TRASH, set))
    } catch {
      // No deleted photos for this set.
    }
    for (const name of Object.keys(items)) {
      if (!media.includes(name) && !inTrash.includes(name)) {
        console.warn(
          `! ${set}/set.json has caption/alt for "${name}" but there is no such file`
        )
      }
    }

    // What's published now: entries whose files are still in the bucket get
    // reused as-is, so unchanged photos are never decoded or uploaded again.
    const previous = new Map(
      ((await getJson(`photos/${set}/manifest.json`))?.photos ?? [])
        .filter((p) => p?.key)
        .map((p) => [p.key, p])
    )

    console.log(`\n${set} (${files.length} files, ${order})`)
    const photos = []
    const seenHashes = new Map()
    for (const file of files) {
      const ext = extOf(file)
      const src = await readFile(path.join(dir, file))
      const { base, hash } = cloudBase(set, file, src)
      if (seenHashes.has(hash)) {
        console.warn(
          `! skipping ${set}/${file}: same photo as ${seenHashes.get(hash)}`
        )
        continue
      }
      seenHashes.set(hash, file)
      const alt = items[file]?.alt ?? altFromName(file)
      const caption = items[file]?.caption
      const loop = loops(items[file])

      if (isVideo(file)) {
        const key = `${base}${ext}`
        const kept = existing.has(key) ? previous.get(key) : null
        if (kept?.width && kept?.height) {
          console.log(`= ${key} (unchanged)`)
          photos.push({ ...kept, alt, caption, loop, type: "video" })
          continue
        }
        const fromCfg =
          items[file]?.width > 0 && items[file]?.height > 0
            ? { width: items[file].width, height: items[file].height }
            : null
        const info = fromCfg ?? mp4Info(src)
        if (!info) {
          fail(
            `Can't read the size of ${set}/${file} — add "width" and "height" for it under "items" in photos-src/${set}/set.json.`
          )
        }
        if (!fromCfg && !playsEverywhere(file, info)) {
          console.warn(
            `! ${set}/${file} is ${info.codec ?? "an unknown codec"} in ${ext} — Firefox and some phones won't play it. Re-add it through the photo manager to convert it.`
          )
        }
        await put(
          key,
          src,
          VIDEO_TYPES[ext],
          `video ${info.width}×${info.height}, ${(src.length / 1024 / 1024).toFixed(1)}MB`
        )
        photos.push({
          key,
          type: "video",
          width: info.width,
          height: info.height,
          alt,
          caption,
          loop,
        })
        continue
      }

      const stripKey = `${base}.webp`
      const fullKey = `${base}.jpg`
      const kept =
        existing.has(stripKey) && existing.has(fullKey)
          ? previous.get(stripKey)
          : null
      if (kept?.width && kept?.height && kept.full?.key) {
        console.log(`= ${stripKey} (unchanged)`)
        const views = kept.views?.every((v) => existing.has(v.key))
          ? kept.views
          : await putViews(src, base)
        photos.push({ ...kept, alt, caption, views })
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

      await put(
        stripKey,
        strip.data,
        "image/webp",
        `${strip.info.width}×${strip.info.height}, ${(strip.data.length / 1024).toFixed(0)}kB`
      )
      await put(
        fullKey,
        full.data,
        "image/jpeg",
        `${full.info.width}×${full.info.height}, ${(full.data.length / 1024).toFixed(0)}kB`
      )
      photos.push({
        key: stripKey,
        width: strip.info.width,
        height: strip.info.height,
        alt,
        caption,
        blurDataURL: `data:image/jpeg;base64,${blur.toString("base64")}`,
        full: {
          key: fullKey,
          width: full.info.width,
          height: full.info.height,
        },
        views: await putViews(src, base),
      })
    }

    // Manifest last: until it lands, the site keeps showing the old set, so a
    // run that dies halfway changes nothing.
    const manifestKey = `photos/${set}/manifest.json`
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: manifestKey,
        Body: JSON.stringify({ photos }, null, 2),
        ContentType: "application/json",
        CacheControl: "public, max-age=300",
      })
    )
    console.log(`↑ ${manifestKey} (${photos.length} items)`)

    // Deleted for real: everything in this set's folder that the new manifest
    // doesn't name goes now. The manifest is already up, so nothing the site is
    // about to read points at these.
    const keep = new Set([manifestKey])
    for (const p of photos) {
      keep.add(p.key)
      if (p.full?.key) keep.add(p.full.key)
      for (const v of p.views ?? []) keep.add(v.key)
    }
    const gone = [...existing.keys()].filter(
      (k) => k.startsWith(`photos/${set}/`) && !keep.has(k)
    )
    for (let i = 0; i < gone.length; i += 1000) {
      const chunk = gone.slice(i, i + 1000)
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: { Objects: chunk.map((Key) => ({ Key })), Quiet: true },
        })
      )
      for (const k of chunk) console.log(`✕ ${k} (deleted from the bucket)`)
    }
    console.log(
      gone.length
        ? `\n${photos.length} photos live, ${gone.length} file(s) deleted — the site follows within a minute`
        : `\nthe site follows within a minute`
    )
  }

  /**
   * The full-view WebPs for one photo, smallest first. A size already in the
   * bucket isn't encoded again: its pixel size is worked out instead.
   */
  async function putViews(src, base) {
    const { autoOrient } = await sharp(src).metadata()
    const { width, height } = autoOrient
    const side = Math.max(width, height)
    const views = []
    for (const s of viewSides(side)) {
      const key = `${base}-${s}.webp`
      if (existing.has(key)) {
        console.log(`= ${key} (in bucket)`)
        views.push({
          key,
          width: Math.round((width * s) / side),
          height: Math.round((height * s) / side),
        })
        continue
      }
      const view = await sharp(src)
        .rotate()
        .resize(s, s, { fit: "inside", withoutEnlargement: true })
        // Slowest, smallest encode: these are the heavy files, and only the
        // first publish of a photo pays for it.
        .webp({ quality: 75, effort: 6 })
        .toBuffer({ resolveWithObject: true })
      await put(
        key,
        view.data,
        "image/webp",
        `${view.info.width}×${view.info.height}, ${(view.data.length / 1024).toFixed(0)}kB`
      )
      views.push({ key, width: view.info.width, height: view.info.height })
    }
    return views
  }

  async function put(key, body, contentType, note) {
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
        CacheControl: IMMUTABLE,
      })
    )
    existing.set(key, { Key: key })
    console.log(`↑ ${key}${note ? ` (${note})` : ""}`)
  }
}
