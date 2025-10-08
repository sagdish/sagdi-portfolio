import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

type Props = {
  title: string
  description: string
  href?: string
  image?: string
  imageAlt?: string
}

export function FeaturedProjectCard({
  title,
  description,
  href,
  image,
  imageAlt,
}: Props) {
  return (
    <section className="rounded-xl border bg-card text-card-foreground shadow-md overflow-hidden">
      {/* md+: split layout */}
      <div className="md:grid md:grid-cols-5">
        {/* Image placeholder - 4.5:3 on mobile, full height on md */}
        <div className="bg-muted/50 md:col-span-3 p-[3%]">
          <div
            className="relative w-full md:h-full rounded-lg overflow-hidden"
            style={{ paddingTop: "66.67%" }}
          >
            {image ? (
              <Image
                src={image}
                alt={imageAlt || title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 60vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/60 text-sm">
                Featured image
              </div>
            )}
          </div>
        </div>
        {/* Content */}
        <div className="p-5 md:p-6 md:col-span-2 flex flex-col">
          <span className="inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-xs text-foreground/70">
            Live
          </span>
          <h3 className="mt-3 text-2xl font-semibold leading-tight md:text-3xl">
            {title}
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            {description}
          </p>
          <div className="mt-5">
            {href ? (
              <Button asChild>
                <Link href={href} target="_blank" rel="noopener noreferrer">
                  View project
                </Link>
              </Button>
            ) : (
              <Button>View project</Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
