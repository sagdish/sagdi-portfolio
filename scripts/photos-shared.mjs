/**
 * Shared photo rules for scripts/photos-sync.mjs and the local photo manager
 * (gitignored photo-manager/, opened in a browser to reorder / add / delete).
 *
 * Both import this file so the manager always shows the order, names and
 * warnings the sync will actually publish — one rule, one place.
 */
import { createHash } from "node:crypto"
import path from "node:path"

/** Bump to re-encode and re-upload every photo. */
export const PIPELINE = "v1"
export const STRIP_HEIGHT = 720
export const MAX_SIDE = 3000
export const IMMUTABLE = "public, max-age=31536000, immutable"

/**
 * .heic is deliberately absent: the installed sharp reads heif only for .avif,
 * so a HEIC file would crash the sync. The manager converts HEIC to JPEG with
 * the built-in `sips` when you add one.
 */
export const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".tif",
  ".tiff",
])
export const VIDEO_TYPES = {
  ".mp4": "video/mp4",
  ".m4v": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
}
export const MP4_FAMILY = new Set([".mp4", ".m4v", ".mov"])

export const extOf = (file) => path.extname(file).toLowerCase()
export const isVideo = (file) => extOf(file) in VIDEO_TYPES
export const isImage = (file) => IMAGE_EXTENSIONS.has(extOf(file))

/**
 * Files the sync will publish. Dotfiles are out: macOS and zip tools leave
 * `._photo.jpg` resource forks around, and sharp throws on them.
 */
export const isMedia = (file) =>
  !file.startsWith(".") && (isImage(file) || isVideo(file))

/**
 * Why a file that looks like a photo or video can't be published — or null
 * when it's fine, or isn't media at all (set.json, .DS_Store).
 */
export function unusableReason(file) {
  const ext = extOf(file)
  const looksMedia =
    IMAGE_EXTENSIONS.has(ext) || ext in VIDEO_TYPES || ext === ".heic"
  if (!looksMedia) return null
  if (file.startsWith("."))
    return "hidden file left behind by macOS or a zip tool"
  if (ext === ".heic")
    return "HEIC can't be read — add it through the photo manager, which converts it to JPEG"
  return null
}

/**
 * Publish order for one set.
 *
 * `sequence` (written by the photo manager) is the explicit order. Files that
 * aren't in it — copied into the folder in Finder, or renamed there — join at
 * the newest end: the front of a "newest-first" set, the back of an
 * "oldest-first" one. Names in `sequence` with no file are dropped, and a name
 * listed twice counts once.
 *
 * With no sequence this is the original rule: by file name, reversed for
 * newest-first.
 */
export function orderFiles(files, cfg = {}) {
  const newestFirst = (cfg.order ?? "oldest-first") === "newest-first"
  const present = new Set(files)
  const seen = new Set()
  const listed = []
  for (const name of Array.isArray(cfg.sequence) ? cfg.sequence : []) {
    if (present.has(name) && !seen.has(name)) {
      seen.add(name)
      listed.push(name)
    }
  }
  const rest = [...files].filter((f) => !seen.has(f)).sort()
  if (newestFirst) return [...rest.reverse(), ...listed]
  return [...listed, ...rest]
}

/** Names in a set.json sequence that no longer have a file. */
export const missingFromSequence = (files, cfg = {}) =>
  (Array.isArray(cfg.sequence) ? cfg.sequence : []).filter(
    (name) => !files.includes(name)
  )

/**
 * Where a file lands in the bucket: photos/<set>/<clean name>-<hash of the
 * bytes>. Content in the hash means an edited photo gets a new name and can be
 * cached forever; the readable stem is there so the bucket stays browsable.
 */
export function cloudBase(set, file, bytes) {
  const stem = path
    .basename(file, path.extname(file))
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
  const hash = createHash("sha1")
    .update(PIPELINE)
    .update(bytes)
    .digest("hex")
    .slice(0, 8)
  return { base: `photos/${set}/${stem}-${hash}`, stem, hash }
}

/** Alt text fallback when set.json has none: the file name, minus its numbers. */
export const altFromName = (file) =>
  path
    .basename(file, path.extname(file))
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/^[\d-_ ]+/, "")
    .replace(/[-_]+/g, " ")

/** Walk the boxes (atoms) of an ISO base media file: mp4 / m4v / mov. */
function* boxes(buf, start, end) {
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

function child(buf, box, type) {
  for (const b of boxes(buf, box.body, box.end)) if (b.type === type) return b
  return null
}

/**
 * Display size and codec of an mp4-family file, from the video track.
 *
 * tkhd holds the un-rotated size plus a transform matrix; phones record
 * portrait as landscape + a 90° matrix, and browsers honour the matrix, so a
 * rotated track reports swapped dimensions. The codec is the four-letter tag in
 * stsd: avc1 (H.264, plays everywhere), hvc1/hev1 (HEVC — Chrome on a Mac plays
 * it, Firefox and some phones don't).
 *
 * Returns null when there's no video track.
 */
export function mp4Info(buf) {
  const fixed = (at) => buf.readInt32BE(at) / 65536
  for (const moov of boxes(buf, 0, buf.length)) {
    if (moov.type !== "moov") continue
    for (const trak of boxes(buf, moov.body, moov.end)) {
      if (trak.type !== "trak") continue
      const tkhd = child(buf, trak, "tkhd")
      if (!tkhd) continue
      const version = buf.readUInt8(tkhd.body)
      // version+flags, times/ids/duration, reserved+layer+group+volume+reserved
      const matrix = tkhd.body + 4 + (version === 1 ? 32 : 20) + 16
      const width = fixed(matrix + 36)
      const height = fixed(matrix + 40)
      if (!(width > 0 && height > 0)) continue // audio / other track
      const rotated = fixed(matrix) === 0 && fixed(matrix + 16) === 0
      let codec = null
      const stsd = ["mdia", "minf", "stbl", "stsd"].reduce(
        (box, type) => (box ? child(buf, box, type) : null),
        trak
      )
      if (stsd && stsd.body + 16 <= stsd.end) {
        // full box header (4) + entry count (4), then the first entry:
        // size (4) + four-letter format tag
        codec = buf.toString("latin1", stsd.body + 12, stsd.body + 16)
      }
      return {
        width: Math.round(rotated ? height : width),
        height: Math.round(rotated ? width : height),
        codec,
      }
    }
  }
  return null
}

/** H.264 in an mp4 is the only video every browser plays. */
export const playsEverywhere = (file, info) =>
  MP4_FAMILY.has(extOf(file)) &&
  extOf(file) !== ".mov" &&
  info?.codec === "avc1"
