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
