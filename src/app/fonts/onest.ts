import localFont from "next/font/local"

/**
 * Onest (OFL), the sans font for Russian only: Hanken Grotesk has no basic Cyrillic.
 * Used through `html:lang(ru)` in globals.css; en and uz never reference it.
 * Onest draws its letters 6.5% taller than Hanken at the same px (x-height 527 vs 493
 * per 1000), so size-adjust scales it to 93.5% and Russian text matches English in size.
 */
export const onest = localFont({
  src: "./Onest-Variable.woff2",
  weight: "100 900",
  variable: "--font-onest",
  display: "swap",
  preload: false,
  declarations: [{ prop: "size-adjust", value: "93.5%" }],
})
