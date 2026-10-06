# sagdi.com: rules for every session

Next.js 15 App Router, React 19, Tailwind v4, next-intl (en unprefixed, `/ru`, `/uz`), next-themes.
Branch `rewamp2026` replaces `main` (live) at launch. Status and launch checklist:
`transition_todo_delete_after`. Read it first, keep its boxes current.

## Map

- Routes in `src/app/[locale]/`: `/` `/building` `/building/[slug]` `/writing` `/writing/[slug]` `/world` `/work`.
- Shell in `[locale]/layout.tsx`: rail at ≥880px, glass dock + top pill below. Pages scroll inside `#scroller`, not the window.
- New route: add it to `NAV_ITEMS` (`components/shell/nav.ts`) and `app/sitemap.ts`, and give the page `pageMetadata()` (`lib/seo.ts`).
- Copy: every user-visible string, aria-labels included, lives in `messages/{en,ru,uz}.json`. ru and uz mirror en until they're translated.
- Outside URLs: only in `content/links.ts`. Products: `content/products.ts`. Cross-folder imports use `@/*`.
- Blog: Notion (`lib/notion.ts` via `lib/writing.ts`, sample posts as fallback). Photos: R2 (`lib/photos.ts`, `npm run photos:sync`, `photo-manager/`). Contact: `api/contact/route.ts` (Resend). Env vars: `env.local.template`.
- `legacy/` is the old site, frozen and excluded from the build. Don't touch it.

## Design system

- Tokens in `src/app/globals.css` (`:root` / `.dark`): colors, `--r-*` radii, `--dur*` / `--ease-*` motion, `--focus-ring`. Component CSS in `src/app/design.css`. No raw hex, radius px or durations anywhere else. Known exceptions: OG/icon images, the rail cat's palette, the rainbow glow.
- Style with the semantic classes in `design.css`. No `style={{}}` in pages; the only exception is per-item data such as `--ar`.
- Reuse before adding a class:
  - type roles (eyebrow / label / meta);
  - the bordered-control group (`.chip .tagchip .railsub .pcar-btn .lang-btn`);
  - the popover (`.tb-menu .lang-menu`);
  - `.btn .btn-primary`, `.card`, `.sec-head`, `.section` + `.section-body`, `.cta`.

  A new label or control joins the existing grouped selector. Don't redeclare its font, size, letter-spacing or border.

- Every `:hover` rule goes inside `@media (hover: hover)`. One hover per kind:
  - controls brighten their border and background, with no lift;
  - cards lift 3px;
  - list rows nudge their content.

  Animate only `transform` and `opacity`, never padding, margin or size.

- Reveal-on-scroll: `<Reveal>` / `useReveal` set `data-reveal` and animate `translate`.
  - Never put `transform` or `transition` rules on `[data-reveal]`.
  - Never go back to a reveal class.
  - Content that is on screen at load must render visible from the server.
- Non-clickable chips get `.static`.
- One `<h1>` per page, sections use `<h2>`, and no level is skipped.
- Mobile first: check a 390px phone, then tablet and desktop, in light and dark.

## Copy

- No em dashes in user-visible text.
- Sentence case ("Read more").
- Link chips and buttons: external ones end with ↗, internal ones with →.

## Workflow

- Before implementing a plan, commit the work that is already uncommitted, as its own commit.
- Commits and PRs: never any AI attribution (no `Co-Authored-By`, no "Generated with"). Never change the author.
- Done means `npm run typecheck`, `npm run lint` and `npm run build` pass, and the change is checked in the running app in a headless browser.
  - Never use the user's own Chrome or tabs.
  - Anything not run is UNVERIFIED.
- Check a port is free before starting a server. Other local apps run here, for example on 3100.
- The pre-commit hook runs eslint and prettier (lint-staged).
