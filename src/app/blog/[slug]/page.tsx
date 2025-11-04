import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPostBySlug, getPublishedPosts } from "@/lib/notion"
import { Calendar } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"
import rehypeRaw from "rehype-raw"

type Props = {
  params: Promise<{ slug: string }>
}

// Generate static paths for all published posts
export async function generateStaticParams() {
  const posts = await getPublishedPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: "Post Not Found",
    }
  }

  return {
    title: `${post.title} | Sagdi Formanov`,
    description: post.description || `Read about ${post.title}`,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedDate,
      tags: post.tags,
    },
  }
}

// Revalidate every 60 seconds (ISR)
export const revalidate = 60

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const formattedDate = new Date(post.publishedDate).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  )

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <time dateTime={post.publishedDate}>{formattedDate}</time>
          </div>
        </div>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-foreground/10 bg-muted px-3 py-1 text-sm font-medium text-foreground/80 dark:border-muted/40"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeRaw]}
          components={{
            // Style headings
            h1: ({ ...props }) => (
              <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />
            ),
            h2: ({ ...props }) => (
              <h2 className="text-2xl font-bold mt-6 mb-3" {...props} />
            ),
            h3: ({ ...props }) => (
              <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />
            ),
            // Style paragraphs
            p: ({ ...props }) => (
              <p
                className="mb-4 leading-relaxed text-foreground/90"
                {...props}
              />
            ),
            // Style links
            a: ({ ...props }) => (
              <a
                className="text-primary hover:underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              />
            ),
            // Style lists
            ul: ({ ...props }) => (
              <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />
            ),
            ol: ({ ...props }) => (
              <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />
            ),
            // Style code blocks
            code: ({
              className,
              ...props
            }: React.HTMLAttributes<HTMLElement>) => {
              const isInline = !className
              return isInline ? (
                <code
                  className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                  {...props}
                />
              ) : (
                <code
                  className="block bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono"
                  {...props}
                />
              )
            },
            // Style blockquotes
            blockquote: ({ ...props }) => (
              <blockquote
                className="border-l-4 border-primary pl-4 italic my-4 text-foreground/80"
                {...props}
              />
            ),
            // Style images
            img: ({ ...props }) => (
              <img className="rounded-lg my-6 w-full" {...props} />
            ),
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  )
}
