import localFont from "next/font/local"

/** MatrixType by GGBotNet (dotted LED road-sign cut) — used on the 404 pages. */
export const matrixType = localFont({
  src: [
    { path: "./MatrixType-Regular.ttf", weight: "400" },
    { path: "./MatrixType-Bold.ttf", weight: "700" },
  ],
  display: "swap",
})
