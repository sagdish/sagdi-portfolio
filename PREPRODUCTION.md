# sagdi.com pre-production checklist

Last updated: 2026-11-05. Branch `rewamp2026` replaces `main` (live) at go-live.

Legend: `[x]` checked and passing · `[ ]` open · **(you)** needs Sagdi · **(preview)** needs a Vercel
preview deploy · **(go-live)** done during or right after go-live.

This file replaces `transition_todo_delete_after` (moved to `legacy/`, frozen). Tick items in the
same commit as the work. The GitHub repo is public: anyone can read this file, so never put secrets,
keys or private URLs here.

---

## A. Blockers: must be true before `main` goes live

### 1. Analytics and monitoring

- [x] Web Analytics: same setup as `main`. Both load `<Analytics />` from `@vercel/analytics/react`
      in `src/app/[locale]/layout.tsx`; neither branch sends custom events (`track()`). The script is
      requested on every page in en, ru, uz (local production build)
- [x] Speed Insights added (`@vercel/speed-insights` 2.0.0, commit `3e54657`). Script requested on
      every page in en, ru, uz
- [x] Vercel's Speed Insights page shows "Get Started" (install package, add component, deploy and
      visit). There is no switch to flip: steps 1 and 2 are done, step 3 is the deploy. (Corrected
      2026-11-05: an earlier line here said "turn it on", which was a guess from a `disabledAt`
      field in Vercel's API. If no data shows after a deploy, that field is the first suspect)
- [ ] On a preview: page views show in Web Analytics and vitals in Speed Insights (switch the
      filter from Production to Preview), and both scripts load with the new
      `X-Content-Type-Options: nosniff` header (locally they are 404 pages, so this can't be
      tested here) **(preview)**

### 2. Security

- [x] No secrets in git history (all branches, every commit): no `.env` file ever committed; no
      Resend, Notion, AWS-style keys or private keys found; `env.local.template` has empty values;
      `.gitignore` covers `.env*`
- [x] Next.js 15.4.8 → 15.5.29 and sharp → 0.35.5: all 33 Next.js advisories fixed (commit `3771fb5`)
- [ ] `npm audit --omit=dev` still lists: postcss bundled inside Next (only Next 16 fixes it; used at
      build time on our own CSS, not reachable by visitors) and source-map-js, nanoid,
      mdast-util-to-hast (`npm audit fix` fixes these three without breaking changes). Do: run
      `npm audit fix`, then typecheck, lint, build, browser runs
- [x] Security headers on every response: `X-Content-Type-Options: nosniff`,
      `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`, no
      `X-Powered-By` (commit `9490949`). HSTS comes from Vercel. No CSP yet (see Later)
- [ ] Contact form abuse (`src/app/api/contact/route.ts`): it had only a honeypot. Fix in two parts:
  - [x] Vercel Firewall rate-limit rule "Contact form rate limit", published to production
        2026-11-05 (Hobby allows 1): POST `/api/contact`, 10 per 10 minutes per IP, then 429.
        Lenient on purpose so real visitors never hit it. Tested on sagdi.com: 10 empty
        submissions answered 400, the 11th and 12th 429; pages and GET unaffected. A future
        `/api/subscribe` needs a condition added to this same rule. See or change it:
        Vercel → sagdi-site → Firewall → Rules, or `vercel firewall rules list --project sagdi-site`
  - [x] The form shows a proper message on 429 in en, ru, uz (`form.tooMany`). Before, it would
        have shown "[object Object]", because the firewall's error is an object. Tested with a
        simulated 429, 400, 500 and 200 in Chromium and WebKit, all 3 languages
  - [ ] Code: cap name, email and message length; the route's own error text ("Invalid email",
        "Server not configured: missing ...", Resend's raw error) is English in every language and
        shows internal details: give visitors the translated fallback, keep details in the server log
- [x] Vercel Firewall active, DDoS mitigation on (Sagdi's screenshot 2026-11-05). Bot Protection
      is off: your call
- [x] Preview deployments require a Vercel login ("all except custom domains")
- Accepted risk: posts render raw HTML from Notion (`rehype-raw`). Only Sagdi writes in Notion

### 3. Production config on Vercel (read through the Vercel CLI, 2026-11-05)

- [x] Production branch is `main`: pushing the new `main` deploys it to sagdi.com
- [x] Env vars exist for Production, Preview and Development: `NOTION_API_KEY`,
      `NOTION_DATABASE_ID`, `NOTION_DATA_SOURCE_ID`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`,
      `CONTACT_FROM_EMAIL`, `PHOTOS_BASE_URL`, `TAILWIND_DISABLE_LIGHTNINGCSS`. Values not checked
- [ ] On the preview: Writing lists the posts, home shows the real photos (not the sample frames).
      Both fail quietly if a variable is wrong **(preview)**

### 4. Domain

- [ ] `https://www.sagdi.com` shows a browser security warning today: it serves an expired
      `*.sagdi.com` certificate (expired 2025-11-05). `www.sagdi.com` is not added to the Vercel
      project (only `sagdi.com` and `sagdi-site.vercel.app` are), but DNS still points it at Vercel.
      Fix: Vercel → sagdi-site → Settings → Domains → Add → `www.sagdi.com`; UNCHECK "Include apex
      and www variants" (sagdi.com is already there and would be set to redirect to itself);
      choose "Redirect to Another Domain", 308, `sagdi.com`. If Vercel then says "Invalid
      Configuration", add the DNS record it shows in GoDaddy. Already broken on the live site, not
      caused by the new one **(you)**
- [x] `https://sagdi.com`: valid certificate until 2027-01-19 (auto-renew on), http redirects to
      https, HSTS on

### 5. Real devices and real services (all on the preview)

- [ ] iPhone Safari, Android Chrome, Brave on iPhone: every page, light and dark, en, ru, uz.
      Previews need you signed in to Vercel on the phone **(preview)** **(you)**
- [ ] Home carousel on a phone: the first photos show fast, swiping loads the rest, the video plays
- [ ] Frosted glass on the dock and top pill on a real iPhone (headless WebKit draws no blur)
- [ ] Contact form: a real email arrives, subject "sagdi.com: New message from ..." **(preview)**
- [ ] Inbox the contact form sends to: Vercel → sagdi-site → Settings → Environment Variables →
      `CONTACT_TO_EMAIL` → edit (Production, and Preview to test) → redeploy. A changed variable
      only takes effect on the next deployment. `CONTACT_FROM_EMAIL` must stay an address on a
      domain verified in Resend **(you)**
- [ ] Link previews in Telegram and LinkedIn, en and ru. Preview URLs need a login, so bots can't
      read them: check on sagdi.com right after go-live **(go-live)**

### 6. Content: your own finish line (from the old status doc)

The old status doc said "zero sample chips, then go live". Zero sample chips: done (0 on all 36
pages in en, ru, uz). Decide for each below: blocker or Later **(you)**

- [ ] English product texts still waiting on your words: ReguSelf, Pomodoro Focus Dock, Screenshots
      Processor (to be replaced by the YouTube transcript tool: name, status, link), finKeep (body
      repeats the tagline). Personal OS longer text drafted, waiting for your approval
- [ ] Search text per page (`meta.pages.*`, `meta.default` in `messages/*.json`) still mirrors the
      on-page heading; the Writing search description is the old long text
- [ ] ru and uz: your review of the open judgment calls (Cyrillic name, ты/вы split, slogan), a
      native Uzbek proofread, and the new Work strings (they still mirror English)
- [ ] Photo alt text: all empty (photo manager, alt box)
- [ ] Subscribe on the live site shows "prototype · not wired to a backend yet" and "You're on the
      list ✓ (prototype, nothing was actually sent)". Keep as is, or hide the band and the Subscribe
      button until it works

### 7. Speed, SEO and errors (production build, headless Chromium + WebKit, 2026-11-05)

- [x] Home: first photo at 1.6 s on a slow phone connection (was 5.8 s), score 99; other pages
      about 1.5 s; layout shift 0.033 at most (Google's limit is 0.1). Commit `b6e6de8`
- [x] SEO: own canonical on every page; hreflang en, ru, uz, x-default on every page and each links
      back; `<html lang>` right; sitemap has 36 entries (33 pages in 3 languages + 3 posts);
      `robots.txt`; structured data (Person, WebSite, CreativeWork, BlogPosting with image);
      preview image per language
- [x] Old live URLs (`/blog`, `/blog/:slug`, `/about`, `/contact`, `/projects`, `/hub`, ru and uz
      too) reach the new page in one redirect (local build)
- [x] 404 page in all 3 languages, status 404, inside the site shell
- [x] iPhone home-screen icon loads (was 404), commit `9490949`
- [x] Work page no longer slides sideways at 390 and 1280
- [x] Blog post lists show bullets (open in the old status doc, fixed since)

---

## B. Go-live steps, in order

1. Clear section A.
2. Push `rewamp2026` to GitHub (it is 10+ commits ahead). Vercel builds a preview; run every
   **(preview)** item on it.
3. Branches, locally first:
   1. Rename `main` → `pre-nov-2026-version`.
   2. On `pre-nov-2026-version`, add one commit with only what it doesn't have yet, under
      `legacy/`: `legacy/README.md` and `legacy/transition_todo_delete_after`. The other 50 files
      in `legacy/` are identical to the old site already in that branch.
   3. Rename `rewamp2026` → `main`.
   4. On the new `main`: delete `legacy/`; remove the packages only `legacy/` used (`motion`,
      `svg-dotted-map`, `@radix-ui/react-navigation-menu`). Keep `lightningcss` (added on
      purpose to fix a Vercel build, commit `062d773`) and `react-dom` (Next needs it). Update the
      two `CLAUDE.md` lines that point into `legacy/` (the old status doc lives on only in
      `pre-nov-2026-version`). Then typecheck, lint, build, browser runs.
4. Push. `main` on GitHub fast-forwards (checked: the old `main` is fully inside this branch's
   history, so no force push). Production deploys. Also push `pre-nov-2026-version`.
5. Right after: sagdi.com loads; old URLs redirect; `sitemap.xml` and `robots.txt` load; Web
   Analytics and Speed Insights show data; Telegram and LinkedIn previews; Google Search Console:
   submit the sitemap and check the en/ru/uz pairs.
6. If something breaks: Vercel → sagdi-site → Instant Rollback. On Hobby it goes back to the
   previous production deployment only. After a rollback, pushes to `main` don't go live until
   you press "Undo Rollback". The old code stays in `pre-nov-2026-version`; the exact old live
   state is commit `1274864`.

---

## C. Later: not blocking

From Sagdi:

- [ ] Subscribe works (plan in D)
- [ ] Cat in the box on mobile too (today only in the desktop rail)
- [ ] World page: the rest of the content, then remove the "still cooking" placeholder
- [ ] Translation buttons on blog posts: read a post in another language

Suggested (move up, keep or drop):

- [ ] Notion post images expire after 1 hour (signed links). Seen 2026-11-05: one load of
      `/writing/pspo` served an expired link and the image was broken until the page refreshed.
      Fix with the move of images to Cloudflare
- [ ] Photos load from `pub-…r2.dev`, which Cloudflare says is rate-limited and for development
      only, with no caching. A custom domain (`photos.sagdi.com`) needs sagdi.com's DNS moved
      from GoDaddy to Cloudflare
- [ ] Writing shows an empty list with no message if Notion fails, and that empty page is cached
      until the next refresh
- [ ] Contrast under 4.5:1 for small text (`--faint`, the blue accent as text): token change, needs
      your yes. Also the ReguSelf link in home text has no underline, and the PSPO image alt is its
      file name
- [ ] Full Content-Security-Policy header
- [ ] Error alerts, so you know when visitors hit errors
- [ ] Next.js 16 (fixes the last postcss advisory); move `npm run lint` off `next lint`
      (deprecated in 15.5)
- [ ] `apple-icon.tsx` still draws the old "S", not the SF logo
- [ ] uz: the `ʻ` letter falls back to Arial (Hanken has no glyph); ru: the → arrow is shorter in
      Onest
- [ ] Product screenshots on product pages (strip is built, no photos yet); Pomodoro Focus Dock
      info and images from you
- [ ] Your sign-off on the three drawn product logos; the open subscribe box style picks

---

## D. Subscribe: plan (researched 2026-11-05, not built)

**Pick: Resend**, already the contact form's email provider.

- Same account and API key, already set in Vercel. Free marketing plan: 1,000 contacts, no
  monthly send cap; $40/month for 5,000 ([pricing](https://resend.com/pricing)).
- You write each newsletter in Resend's editor (a Broadcast) and send it to a segment. Resend adds
  a per-person unsubscribe link and keeps the unsubscribe list itself
  ([broadcasts](https://resend.com/docs/dashboard/broadcasts/introduction),
  [unsubscribe list](https://resend.com/docs/dashboard/contacts/managing-unsubscribe-list)).
- The form keeps this site's design; no third-party script on the page.
- What Resend doesn't do: double opt-in. The docs don't mention it
  ([contacts](https://resend.com/docs/dashboard/contacts/introduction)), so we build it (below).

Compared: [Kit](https://kit.com/pricing) is free up to 10,000 subscribers, but it's a second
account, and your list and forms live there. [Buttondown](https://buttondown.com/pricing) is free
only for the first 100 subscribers.

How it would work:

1. A visitor enters an email. `/api/subscribe` (honeypot + the `/api/` rate-limit rule) emails a
   "Confirm your subscription" message in the page's language, with a signed link that expires.
   No database: the link carries the email and expiry, signed with a secret.
2. The link opens `/api/subscribe/confirm`. It checks the signature, adds the contact to a Resend
   segment ("Writing"), and shows "You're subscribed".
3. New post: write a Broadcast in Resend (or paste the post link and a line), send it to the
   segment.

You do once: create the segment, set the unsubscribe page in Resend, and add one secret env var in
Vercel. Code: two small API routes, success and error text in en, ru, uz, remove the prototype
notes, and one privacy line under the form ("Unsubscribe anytime. Your email is only used for
this."). Later option: email new Notion posts automatically (needs an RSS feed or a scheduled job).

---

## Sources (opened 2026-11-05)

- Vercel production checklist: https://vercel.com/docs/production-checklist
- Vercel WAF rate limiting (Hobby: 1 rule, 10 s to 10 min window):
  https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting
- Vercel Instant Rollback (Hobby: previous deployment only): https://vercel.com/docs/instant-rollback
- Cloudflare R2 public buckets (r2.dev is for development): https://developers.cloudflare.com/r2/buckets/public-buckets/
- Google, language versions (hreflang): https://developers.google.com/search/docs/specialty/international/localized-versions
- Core Web Vitals thresholds: https://web.dev/articles/vitals
- Full audit write-up: https://claude.ai/artifact/1niNnGSmyCHbzoy9nu7U6G
