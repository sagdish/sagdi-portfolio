import Image from "next/image"
import { ArrowUpRight } from "lucide-react"

type Props = {
  title: string
  description: string
  href?: string
  image?: string
  imageAlt?: string
  status?: string
}

export function ProjectCard({
  title,
  description,
  href,
  image,
  imageAlt,
  status,
}: Props) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
      {/* 16:9 placeholder */}
      <div className="bg-muted/50 p-[3%]">
        <div
          className="relative w-full rounded-lg overflow-hidden"
          style={{ paddingTop: "56.25%" }}
        >
          {image ? (
            <Image
              src={image}
              alt={imageAlt || title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/60 text-sm">
              Image placeholder
            </div>
          )}
        </div>
        {status ? (
          <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground/70 shadow-sm ring-1 ring-border/70">
            {status}
          </span>
        ) : null}
      </div>
      <div className="p-4">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-base font-semibold leading-tight text-primary hover:underline"
          >
            {title}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        ) : (
          <h4 className="text-base font-semibold leading-tight">{title}</h4>
        )}
        <p className="mt-2 text-sm text-foreground/80 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
}
