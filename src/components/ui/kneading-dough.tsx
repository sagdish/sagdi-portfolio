// "Still cooking" art for unfinished pages: a rolling pin presses a ball of dough
// on a board, flour puffs out, it springs back, on a loop. Pure SVG + CSS
// (design.css, "Still cooking"); decorative, so the text next to it carries the meaning.
export function KneadingDough() {
  return (
    <svg className="wip-art" viewBox="0 0 220 150" aria-hidden="true">
      <rect
        className="wip-wood"
        x="24"
        y="122"
        width="172"
        height="12"
        rx="6"
      />

      <g className="wip-puff l">
        <circle cx="50" cy="116" r="4" />
        <circle cx="42" cy="108" r="2.5" />
      </g>
      <g className="wip-puff r">
        <circle cx="170" cy="116" r="4" />
        <circle cx="178" cy="108" r="2.5" />
      </g>

      <g className="wip-dough">
        <path
          className="wip-blob"
          d="M56 123 C52 92 78 68 110 68 C142 68 168 92 164 123 Z"
        />
        <ellipse
          className="wip-shine"
          cx="88"
          cy="84"
          rx="10"
          ry="4.5"
          transform="rotate(-24 88 84)"
        />
        <ellipse className="wip-cheek" cx="89" cy="107" rx="4.5" ry="2.5" />
        <ellipse className="wip-cheek" cx="131" cy="107" rx="4.5" ry="2.5" />
        <circle className="wip-eye" cx="98" cy="100" r="2.8" />
        <circle className="wip-eye" cx="122" cy="100" r="2.8" />
        <path className="wip-line" d="M104 107 Q110 112 116 107" />
      </g>

      <g className="wip-pin">
        <rect
          className="wip-wood"
          x="28"
          y="46"
          width="26"
          height="10"
          rx="5"
        />
        <rect
          className="wip-wood"
          x="166"
          y="46"
          width="26"
          height="10"
          rx="5"
        />
        <rect
          className="wip-wood"
          x="50"
          y="40"
          width="120"
          height="22"
          rx="11"
        />
        <path className="wip-grain" d="M70 47 H96 M112 55 H150" />
      </g>
    </svg>
  )
}
