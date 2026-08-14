import type { BlogPost } from "@/types/blog"
import { getAllTags, getPostBySlug, getPublishedPosts } from "./notion"
import { SAMPLE_POSTS } from "@/content/sample-posts"

/**
 * Writing data layer with a safe fallback: use real Notion posts when the client is
 * configured (NOTION env present) and returns data; otherwise fall back to the sample
 * posts so the pages always render. `sample` flags placeholder content for the UI.
 */
export async function listPosts(): Promise<{
  posts: BlogPost[]
  sample: boolean
}> {
  try {
    const posts = await getPublishedPosts()
    if (posts.length) return { posts, sample: false }
  } catch {
    // Notion not configured / unreachable — fall through to samples.
  }
  return { posts: SAMPLE_POSTS, sample: true }
}

export async function getPost(
  slug: string
): Promise<{ post: BlogPost | null; sample: boolean }> {
  try {
    const post = await getPostBySlug(slug)
    if (post) return { post, sample: false }
  } catch {
    // fall through to samples
  }
  const sample = SAMPLE_POSTS.find((p) => p.slug === slug) ?? null
  return { post: sample, sample: Boolean(sample) }
}

export async function listTags(): Promise<string[]> {
  try {
    const tags = await getAllTags()
    if (tags.length) return tags
  } catch {
    // fall through
  }
  return Array.from(new Set(SAMPLE_POSTS.flatMap((p) => p.tags))).sort()
}
