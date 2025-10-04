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
      title: "TripLens",
      description:
        "AI-assisted travel planner that builds day-by-day itineraries from your preferences.",
    },
    {
      title: "Feedback Hub",
      description:
        "Lightweight feedback widget for product teams to collect, triage, and act on insights.",
    },
    {
      title: "Churn Watch",
      description:
        "Dashboard that highlights at-risk cohorts and suggests retention experiments.",
    },
    {
      title: "Content Pilot",
      description:
        "Editorial calendar with AI draft assistance and simple approval workflows.",
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
          />
        ))}
      </div>
    </div>
  )
}
