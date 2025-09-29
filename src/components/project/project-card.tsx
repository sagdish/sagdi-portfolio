type Props = {
  title: string
  description: string
}

export function ProjectCard({ title, description }: Props) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
      {/* 16:9 placeholder */}
      <div className="bg-muted/50">
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/60 text-sm">
            Image placeholder
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold leading-tight">{title}</h3>
        <p className="mt-2 text-sm text-foreground/80 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
}
