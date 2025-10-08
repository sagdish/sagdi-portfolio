# GitHub Copilot Instructions

## Project snapshot

- Next.js 15 App Router portfolio deployed at `sagdi.com`; all routes live under `src/app` with per-page `metadata` exports and shared `RootLayout` wiring header/footer/theme.
- UI is Tailwind CSS v4 (configured in `src/app/globals.css`) plus reusable primitives in `src/components/ui`; the `cn` helper merges classes via `clsx`+`tailwind-merge`.

## Architecture highlights

- Pages live in `src/app/{page}/page.tsx`; most sections compose client components from `src/components/...`.
- `RootLayout` wraps content in `ThemeProvider` (`next-themes`) and shared `Header`/`Footer` navigation blocks.
- `Home` features a hero with animated particles (`ui/particles`) whose color syncs with the active theme and a horizontally scrolling PM highlight section (`sections/pm-portfolio`).
- Maps render via `HeroMap` → dynamic `DottedMap` (`ui/dotted-map`) to avoid SSR mismatches; markers are centralized in `sections/map-markers.ts`.
- Project listings use `FeaturedProjectCard` + `ProjectCard` components; buttons and CTAs rely on `<Button asChild>` so links/buttons stay stylistically consistent.

## Data & integrations

- Contact workflow: `components/forms/contact-form.tsx` POSTs JSON to `app/api/contact/route.ts`. The API validates name/email/message, checks a honeypot (`website` field), and sends email through Resend.
- Required environment variables for contact delivery: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`. Missing values surface a 500 with the variable names—mirror that logic when adding new env-dependent handlers.

## Styling & interaction patterns

- Always prefer Tailwind utility composition; global design tokens (colors, radii, marquee animations) live in `globals.css` under `@theme inline`.
- Client interactivity requires `'use client'` at the file top (e.g., navigation menu, particles, contact form). Avoid mixing server/client logic in the same file.
- Navigation and footer menus source their link definitions from local arrays; update those arrays when adding routes to keep the UI in sync.
- Animated marquee sections toggle pause via React state and class switches (`animate-marquee-scroll` + `.paused`). Reuse that pattern for similar scrollers.

## Developer workflow

- Install deps with `npm install` (project uses npm scripts). Common commands: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`, `npm run typecheck`, `npm run format:check`.
- Husky + lint-staged enforce ESLint + Prettier on staged files; keep generated code lint-clean before committing.
- TypeScript path alias `@/*` resolves into `src/*`; import shared utilities via that alias instead of relative paths.

## Gotchas & tips

- Dynamic resources (maps, particle canvas) depend on client-only APIs; wrap new browser-dependent utilities in `next/dynamic` with `{ ssr: false }` when needed.
- The contact API escapes HTML manually (`escapeHtml`)—use the same helper if you add new fields that reach the email template.
- `Button` variants come from `class-variance-authority`; when adding new button types, extend `buttonVariants` so all call sites inherit the new style.
- Sitemap (`app/sitemap.ts`) defines canonical routes—update priorities/frequencies when creating additional pages.
- Static assets (logos, hero images) live in `public/`; prefer Next `<Image>` with proper `sizes` to keep Core Web Vitals healthy.

Keep instructions updated as you add routes, sections, or data flows. Let me know which areas need more detail or clarification so I can refine this guide.
