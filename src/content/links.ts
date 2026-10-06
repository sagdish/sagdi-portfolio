/**
 * Every outside profile link on the site, in one place. Pages and the JSON-LD
 * `sameAs` read from here. Rule: music links go to sftunes, every other
 * Telegram link goes to raw_notepad.
 */
export const LINKS = {
  linkedin: "https://linkedin.com/in/sagdi-formanov",
  github: "https://github.com/sagdish",
  instagram: "https://instagram.com/forsi_ph",
  telegram: "https://t.me/raw_notepad",
  threads: "https://www.threads.com/@forsi_ph",
  music: "https://t.me/sftunes",
} as const

/** The home page's Elsewhere row, in order (labels live in `home.elsewhere.*`). */
export const ELSEWHERE = [
  "linkedin",
  "github",
  "instagram",
  "telegram",
  "threads",
] as const satisfies readonly (keyof typeof LINKS)[]
