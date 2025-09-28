import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About | Sagdi Formanov",
  description:
    "Product Manager (PSPO I) with a background in engineering, development, and design.",
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">About</h1>
      <div className="mt-4 space-y-4 text-foreground/90 leading-relaxed">
        <p>
          Hey, I’m Sagdi. I started out in Automobile Engineering, then moved
          through development and design before finding my place in product
          management. That mix of backgrounds shaped how I work today: I like to
          experiment, create, and learn by doing. Nothing is ever constant, so
          I’ve come to favor action over perfection, a lesson I had to learn the
          hard way.
        </p>
        <p>
          As a PM with a software development background, I focus on building
          products that are both user centered and business driven. I’ve led
          teams to launch customer facing features, improve engagement, and make
          collaboration across design and engineering more transparent. In my
          previous roles, I managed the full product lifecycle from early
          research and prototyping to stakeholder collaboration and Agile
          delivery.
        </p>
        <p>
          I’m passionate about user experience, design, and mainly how AI
          technology evolves faster than we can adapt. My way of dealing with
          that is to stay comfortable with discomfort, keep learning, and keep
          building.
        </p>
      </div>
    </div>
  )
}
