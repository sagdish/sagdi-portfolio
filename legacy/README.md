# /legacy — frozen snapshot of the pre-rewamp sagdi.com

This is a **read-only reference copy** of the old site (`src/` + `messages/`) captured at the start
of the `rewamp2026` rebuild. It is **not** part of the build:

- excluded from TypeScript (`tsconfig.json` → `exclude`), ESLint (`eslint.config.mjs` ignores),
  Prettier (`.prettierignore`), and Tailwind's source scan (`globals.css` uses `source("../")`).
- Next.js never routes it (routes live only under the real `src/app`).

Use it only as a **source** to pull specific, hand-picked pieces into the new site:
- the Notion connection (`legacy/src/lib/notion.ts`) — carried into the new `src` verbatim,
- the Resend contact endpoint (`legacy/src/app/api/contact/route.ts`),
- the i18n / SEO plumbing (`legacy/src/i18n/*`, `legacy/src/lib/seo.ts`),
- individual sentences of copy (selected one at a time, never in bulk).

Nothing here should be imported by the live app. Delete this folder once the rebuild is done and
nothing else needs to be referenced from it.
