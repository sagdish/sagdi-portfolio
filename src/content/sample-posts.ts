import type { BlogPost } from "@/types/blog"

// Placeholder posts shown until real Notion posts are connected (no NOTION env in this
// environment). Swapped automatically when getPublishedPosts() returns real data — see
// src/lib/writing.ts. These carry tags so the tag filter is demonstrable.
export const SAMPLE_POSTS: BlogPost[] = [
  {
    id: "sample-personal-os-adhd",
    title: "Building a personal OS for an ADHD brain",
    slug: "personal-os-adhd",
    description:
      "Why I stopped fighting my attention and built a system around it.",
    tags: ["Personal OS", "ADHD", "Systems"],
    published: true,
    publishedDate: "2026-08-01",
    content:
      "This is a placeholder post — the real essay will be connected from Notion.\n\n## Why a system\n\nI stopped fighting my attention and built a system around it instead of relying on willpower.\n",
  },
  {
    id: "sample-one-deep-five-touched",
    title: "One deep, five touched",
    slug: "one-deep-five-touched",
    description: "A seasons model for not dropping every ball at once.",
    tags: ["Systems", "Focus"],
    published: true,
    publishedDate: "2026-07-15",
    content:
      "This is a placeholder post — the real essay will be connected from Notion.\n\nOne area goes deep each season; the other five get *touched*, not dropped.\n",
  },
  {
    id: "sample-design-fullstack-product",
    title: "Design → full-stack → product",
    slug: "design-fullstack-product",
    description: "What each turn taught me, and why the last one stuck.",
    tags: ["Career", "Product"],
    published: true,
    publishedDate: "2026-07-01",
    content:
      "This is a placeholder post — the real essay will be connected from Notion.\n\nDesign taught me taste, full-stack taught me shipping, product tied them together.\n",
  },
]
