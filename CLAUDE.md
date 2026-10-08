# sagdi.com: rules for every session

Next.js 15 App Router, React 19, Tailwind v4, next-intl (en unprefixed, `/ru`, `/uz`), next-themes.
Branch `rewamp2026` replaces `main` (live) at launch.

## Status doc: `transition_todo_delete_after`

- Read it first. It holds the launch checklist (finish line: zero `sample` chips in en, ru, uz),
  what's next and in what order, env vars, and how photos work.
- Update it in the same commit as the work: tick boxes, add newly found work, move sections between
  IN PROGRESS / NEXT / DONE, bump "Last updated". Never delete items. Keep its shape: checkboxes,
  AT A GLANCE on top, REFERENCE at the bottom.
- Sagdi often has it open in vim: re-read it right before editing.

## Map

- Routes in `src/app/[locale]/`: `/` `/building` `/building/[slug]` `/writing` `/writing/[slug]` `/world` `/work`.
- Shell in `[locale]/layout.tsx`: rail at ≥880px, glass dock + top pill below. Pages scroll inside
  `#scroller`, not the window. No `transform`, `filter`, `backdrop-filter`, `will-change` or `contain`
  on any ancestor of the dock or top pill, or they stop being fixed.
- New route: add it to `NAV_ITEMS` (`components/shell/nav.ts`), `app/sitemap.ts` and `meta.pages.*`.
- Copy: every user-visible string, aria-labels included, lives in `messages/{en,ru,uz}.json`.
- Outside URLs: only in `content/links.ts`. Products: `content/products.ts`. Cross-folder imports use `@/*`.
- Blog: Notion (`lib/notion.ts` via `lib/writing.ts`, sample posts as fallback). Photos: R2 (`lib/photos.ts`),
  managed with `photo-manager/`, never by hand. Contact: `api/contact/route.ts` (Resend).
  Env vars: `env.local.template`.
- `legacy/` is the old site, frozen and excluded from the build. Don't touch it.

## Content and languages

- Unfinished copy is marked: a `.sample` chip, `placeholder: true` on a product, or a sample post
  (`isSamplePost`). Remove the marker only when Sagdi gives the real words.
- Product facts come from the OS `PRODUCTS/*/overview.md`, one piece at a time, with his approval.
  Old-site copy is reused only sentence by sentence, with his approval.
- A screenshot or text he shows is the spec: put it in the target file directly. Never search the repo
  for where it came from.
- English is finalized first; ru and uz are translated from it (until then they mirror en).
  A page is done only when its copy and its SEO exist in all three.
- No em dashes in user-visible text. Sentence case ("Read more"). Link chips and buttons:
  external ones end with ↗, internal ones with →.

## SEO (one set per language, like `main`)

- Search text lives in `meta` of each language file, written for search and separate from the
  page's own heading: `meta.default` (home: title, description, keywords), `meta.pages.<page>`,
  `siteName` (title template "… | siteName"), `jobTitle`, `ogImageAlt`.
- Home and list pages use `pageMetadata()` (`lib/seo.ts`). Products and posts build their own with
  `buildOpenGraph()` / `ogImages()`. A page's `openGraph` replaces the layout's, so it must be complete.
- Every page has its own canonical plus hreflang en, ru, uz and x-default (`localeAlternates`).
- The link-preview image is rendered per language from messages (`[locale]/opengraph-image.tsx`).
- Posts are language-agnostic: one unprefixed canonical, no hreflang, no `inLanguage`.
- Placeholders never reach search: sample posts are `noindex` and left out of `sitemap.ts`.

## Design system

- No visible design change without Sagdi's explicit yes. Fix things at the source (tokens and shared
  classes), never with a per-page patch. Mobile first: a 390px phone, then tablet and desktop, light and dark.
- Tokens in `src/app/globals.css` (`:root` / `.dark`): colors, `--r-*` radii, `--dur*` / `--ease-*`
  motion, `--focus-ring`. Component CSS in `src/app/design.css`. Use tokens, not raw values. The only
  raw values are one-off decorative details: OG/icon images, the rail cat, the rainbow glow, the
  live-dot pulse, the 3px nav marker and the 2px flag corners.
- Style with the classes in `design.css`. No `style={{}}` in pages; the only exception is per-item data such as `--ar`.
- Reuse before adding a class:
  - the grouped selectors at the top of `design.css`: type roles (label, nav, meta), the bordered
    control (`.chip .tagchip .railsub .pcar-btn .lang-btn`) and the popover (`.tb-menu .lang-menu`).
    A new label or control joins its group; it doesn't redeclare font, size, letter-spacing or border.
  - `.eyebrow`, `.btn .btn-primary`, `.card`, `.sec-head`, `.section` + `.section-body`, `.cta`,
    `.static` (non-clickable chips).
- Every `:hover` rule goes inside `@media (hover: hover)`. One hover per kind: controls brighten their
  border and background with no lift, cards lift 3px, and list rows nudge their content.
- Never animate layout (padding, margin, size). Movement uses `transform` or `translate`; colors may fade.
- Reveal-on-scroll: `<Reveal>` / `useReveal` set `data-reveal` and animate `translate`.
  - Never put `transform` or `transition` rules on `[data-reveal]`.
  - Never go back to a reveal class.
  - Content that is on screen at load must render visible from the server.
- One `<h1>` per page, sections use `<h2>`, and no level is skipped.

## Workflow

- Before implementing a plan, commit the work that is already uncommitted, as its own commit.
- Commits and PRs: never any AI attribution (no `Co-Authored-By`, no "Generated with"). Never change the author.
- Done means `npm run typecheck`, `npm run lint` and `npm run build` pass, and the change is checked in the
  running app at a phone width and a desktop width, in light and dark. Anything not run is UNVERIFIED.
- Sagdi often runs `npm run dev` here, and it shares `.next`. Never run `next build` in this folder while
  that's running. Test builds go in a copy: rsync the repo (without `node_modules`, `.next`, `.git`,
  `legacy`, `photos-src`) to a scratch dir, symlink `node_modules`, then build and start there on a free port.
  Other local apps run too (for example on 3100).
- Headless checks only, never Sagdi's own Chrome or tabs. `playwright-core` is not a project dependency:
  install it in a scratch dir. A Chromium headless shell is cached in `~/Library/Caches/ms-playwright/`.
- The pre-commit hook runs eslint and prettier (lint-staged).
