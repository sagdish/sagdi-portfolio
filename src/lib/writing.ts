import type { BlogPost } from "@/types/blog"
import { getAllTags, getPostBySlug, getPublishedPosts } from "./notion"

/**
 * Writing data layer over Notion. If Notion is unconfigured or unreachable the
 * lists come back empty and a post lookup returns null (the page 404s).
 */
export async function listPosts(): Promise<BlogPost[]> {
  try {
    return await getPublishedPosts()
  } catch {
    return []
  }
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    return await getPostBySlug(slug)
  } catch {
    return null
  }
}

export async function listTags(): Promise<string[]> {
  try {
    return (await getAllTags()).sort()
  } catch {
    return []
  }
}

/**
 * Post date in the page's language ("October 9, 2026"). Call it on the server
 * only: Chrome has no Uzbek month names and would show "M10".
 */
export function formatPostDate(iso: string, locale: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      })
}
