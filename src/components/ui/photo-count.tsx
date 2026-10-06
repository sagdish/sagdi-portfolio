const pad = (n: number) => String(n).padStart(2, "0")

/** The mono "03 / 18" counter under the photo strip and in the photo viewer. */
export function PhotoCount({ index, total }: { index: number; total: number }) {
  return (
    <div className="pcar-count">
      {pad(index + 1)} / {pad(total)}
    </div>
  )
}
