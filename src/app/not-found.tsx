import Link from "next/link"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 text-foreground/80">
        The page you are looking for doesn’t exist or has been moved.
      </p>
      <div className="mt-6">
        <Link
          href="/"
          className="text-sm font-medium text-primary hover:underline"
        >
          Go back home
        </Link>
      </div>
    </div>
  )
}
