import Image from "next/image"

/**
 * The SF logo (public/logo.png) shown in the rail, the top pill and the phone top
 * bar. Decorative: the link around it already has a name ("SAGDI" text or aria-label).
 */
export function BrandMark() {
  return (
    <Image
      className="brand-sq"
      src="/logo.png"
      alt=""
      width={56}
      height={56}
      priority
    />
  )
}
