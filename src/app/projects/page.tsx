import type { Metadata } from "next"
import { ProjectCard } from "@/components/project/project-card"
import { FeaturedProjectCard } from "@/components/project/featured-project-card"

export const metadata: Metadata = {
  title: "Projects | Sagdi Formanov",
  description: "Portfolio projects by Sagdi Formanov.",
}

export default function ProjectsPage() {
  const items = [
    {
      title: "The Ultimate Guide to Product Management",
      description:
        "A comprehensive, practical resource for aspiring and experienced product managers. Curated by Sagdi Formanov.",
      href: "https://pm-guide.vercel.app/",
      image: "/pm-guide.png",
      imageAlt: "The Ultimate Guide to Product Management resource preview",
    },
    {
      title: "Context Collapse",
      description:
        "Your AI-powered knowledge graph that discovers surprising connections between ideas. Currently in active development with new graph visualizations shipping weekly.",
      href: "https://ctx-collapse.vercel.app/",
      image: "/cxt-collapse.png",
      imageAlt: "Context Collapse knowledge graph interface preview",
      status: "In development",
    },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Projects</h1>
      <div className="mt-6">
        <FeaturedProjectCard
          title="PilotYourself.com - Featured"
          description="AI-powered momentum tracker for ambitious professionals struggling with cognitive overload. Uses Claude AI to analyze your goals and create personalized 4-week tracking cycles focused on energy and momentum over time-based productivity. Full-stack Next.js app with Supabase database."
          href="https://pilotyourself.com"
          image="/pilotyourself-frame.png"
          imageAlt="PilotYourself app interface showing AI-powered goal analysis and tracking features"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {items.map((p) => (
          <ProjectCard
            key={p.title}
            title={p.title}
            description={p.description}
            href={p.href}
            image={p.image}
            imageAlt={p.imageAlt}
          />
        ))}
      </div>
    </div>
  )
}
