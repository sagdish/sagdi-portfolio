/**
 * Sync photography to Cloudflare R2: `npm run photos:sync`
 *
 * Reads ./photos-src (gitignored), processes each image with sharp
 * (EXIF-rotate, cap longest side at 3000px, re-encode JPEG, tiny blur
 * placeholder), uploads everything to the bucket under photos/, and writes a
 * fresh manifest.json — the file lib/photos.ts reads. Filename order (sort by
 * name — prefix e.g. 010-, 020-) is display order. Optional
 * photos-src/meta.json adds alt/captions: { "<filename>": { "alt", "caption" } }.
 *
 * One-time R2 setup:
 *   1. Cloudflare dashboard → R2 → create bucket (e.g. "sagdi-photos").
 *   2. Bucket → Settings → enable public access (r2.dev subdomain) or attach a
 *      custom domain (e.g. photos.sagdi.com) — that base URL is PHOTOS_BASE_URL.
 *   3. R2 → API tokens → create token with Object Read & Write on the bucket →
 *      fills R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY; R2_ACCOUNT_ID is on the
 *      R2 overview page; R2_BUCKET is the bucket name.
 * All four env vars go in .env.local (this script loads it itself).
 */
import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import sharp from "sharp"

const ROOT = path.join(import.meta.dirname, "..")
const SRC_DIR = path.join(ROOT, "photos-src")
const EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".tif",
  ".tiff",
  ".heic",
])
const MAX_SIDE = 3000

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
  console.error(
    `Missing env: ${missing.join(", ")} (see header of this script)`
  )
  process.exit(1)
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

let files
try {
  files = (await readdir(SRC_DIR))
    .filter((f) => EXTENSIONS.has(path.extname(f).toLowerCase()))
    .sort()
} catch {
  console.error(`No ${SRC_DIR} folder — create it and drop photos in.`)
  process.exit(1)
}
if (!files.length) {
  console.error(`No images in ${SRC_DIR}.`)
  process.exit(1)
}

let meta = {}
try {
  meta = JSON.parse(await readFile(path.join(SRC_DIR, "meta.json"), "utf8"))
} catch {
  // meta.json is optional.
}

const photos = []
for (const file of files) {
  const stem = path.basename(file, path.extname(file))
  const key = `photos/${stem}.jpg`
  const image = sharp(path.join(SRC_DIR, file)).rotate()
  const body = await image
    .clone()
    .resize(MAX_SIDE, MAX_SIDE, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer()
  const { width, height } = await sharp(body).metadata()
  const blur = await sharp(body).resize(12).jpeg({ quality: 40 }).toBuffer()

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: "image/jpeg",
      CacheControl: "public, max-age=86400",
    })
  )
  photos.push({
    key,
    width,
    height,
    alt:
      meta[file]?.alt ?? stem.replace(/^[\d-_ ]+/, "").replace(/[-_]+/g, " "),
    caption: meta[file]?.caption,
    blurDataURL: `data:image/jpeg;base64,${blur.toString("base64")}`,
  })
  console.log(
    `↑ ${key} (${width}×${height}, ${(body.length / 1024).toFixed(0)}kB)`
  )
}

await s3.send(
  new PutObjectCommand({
    Bucket: bucket,
    Key: "manifest.json",
    Body: JSON.stringify({ photos }, null, 2),
    ContentType: "application/json",
    CacheControl: "public, max-age=300",
  })
)
console.log(
  `↑ manifest.json (${photos.length} photos) — live within ~1h (ISR revalidate)`
)
