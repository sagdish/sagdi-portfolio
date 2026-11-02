import Image from "next/image"
import type { Product } from "@/content/products"

/**
 * A product's round mark. Decorative (the title next to it names the product), so the
 * image has no alt text.
 */
export function ProductIcon({
  icon,
  large,
}: {
  icon: NonNullable<Product["icon"]>
  large?: boolean
}) {
  return (
    <span className={large ? "picon picon-lg" : "picon"} aria-hidden="true">
      <Image src={icon.src} alt="" width={168} height={168} />
    </span>
  )
}
