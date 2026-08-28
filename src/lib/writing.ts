import type { BlogPost } from "@/types/blog"
import { getAllTags, getPostBySlug, getPublishedPosts } from "./notion"
import { SAMPLE_POSTS } from "@/content/sample-posts"

/**
 * Writing data layer. Real Notion posts (when configured) render with the sample posts
 * kept appended after them; if Notion is unconfigured/unreachable the samples render
 * alone. `sample` is true only when the list is entirely samples (Notion returned
 * nothing) — individual sample cards are flagged in WritingList regardless.
 */
export async function listPosts(): Promise<{
  posts: BlogPost[]
  sample: boolean
}> {
  try {
    const posts = await getPublishedPosts()
    // Keep the placeholders as well: real posts first, sample cards trailing. Section
    // note stays off (sample: false); sample cards are flagged individually instead.
    if (posts.length)
      return { posts: [...posts, ...SAMPLE_POSTS], sample: false }
  } catch {
    // Notion not configured / unreachable — fall through to samples only.
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
  const sampleTags = SAMPLE_POSTS.flatMap((p) => p.tags)
  try {
    const tags = await getAllTags()
    // Merge real + sample tags so the sample cards stay filterable in the tag bar.
    if (tags.length) return Array.from(new Set([...tags, ...sampleTags])).sort()
  } catch {
    // fall through
  }
  return Array.from(new Set(sampleTags)).sort()
}
