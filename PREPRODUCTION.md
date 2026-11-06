# sagdi.com pre-production checklist

Last updated: 2026-11-06. Live since 2026-11-05: `main` is the new site (it was `rewamp2026`); the
old site is in branch `pre-nov-2026-version`.

Legend: `[x]` checked and passing · `[ ]` open · **(you)** needs Sagdi · **(preview)** needs a Vercel
preview deploy · **(go-live)** done during or right after go-live.

This file replaces `transition_todo_delete_after` (frozen, kept in branch `pre-nov-2026-version`
under `legacy/`). Tick items in the
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
  - [x] Checked on sagdi.com right after go-live (2026-11-05) instead: both scripts load with
        nosniff. Web Analytics from `/_vercel/insights/script.js`; Speed Insights from a path
        Vercel gives this project (`/<id>/script.js`, sending to `/<id>/vitals`), set up by
        Vercel itself, which also means Speed Insights is on. Both data addresses are answered by
        Vercel (JSON), not caught by the site's language redirect
  - [ ] A real visit shows up in Vercel → Analytics and Speed Insights (Production). Only a real
        browser can prove it: both scripts send nothing when `navigator.webdriver` is set or the
        browser says "Headless", so no automated test can **(you)**

### 2. Security

- [x] No secrets in git history (all branches, every commit): no `.env` file ever committed; no
      Resend, Notion, AWS-style keys or private keys found; `env.local.template` has empty values;
      `.gitignore` covers `.env*`
- [x] Next.js 15.4.8 → 15.5.29 and sharp → 0.35.5: all 33 Next.js advisories fixed (commit `3771fb5`)
- [x] `npm audit fix` run 2026-11-05: source-map-js, nanoid, mdast-util-to-hast and other indirect
      packages got patch or minor updates; `package.json` unchanged, Next and React unchanged.
      Checked: typecheck, lint, build, 80 browser runs
- [ ] Left on purpose: postcss bundled inside Next (only Next 16 fixes it; used at build time on our
      own CSS, not reachable by visitors). See Later: Next 16
- [x] Security headers on every response: `X-Content-Type-Options: nosniff`,
      `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`, no
      `X-Powered-By` (commit `9490949`). HSTS comes from Vercel. No CSP yet (see Later)
- [x] Contact form abuse (`src/app/api/contact/route.ts`): it had only a honeypot. Fixed in three parts:
  - [x] Vercel Firewall rate-limit rule "API form rate limit", live in production since 2026-11-05
        (Hobby allows 1): any POST to `/api/` (contact form and subscribe), 10 per 10 minutes per
        IP, then 429. Lenient on purpose so real visitors never hit it. Tested on sagdi.com twice:
        10 empty submissions answered 400, the 11th and 12th 429; pages and GET unaffected. See or
        change it: Vercel → sagdi-site → Firewall → Rules, or
        `vercel firewall rules list --project sagdi-site`
  - [x] The form shows a proper message on 429 in en, ru, uz (`form.tooMany`). Before, it would
        have shown "[object Object]", because the firewall's error is an object. Tested with a
        simulated 429, 400, 500 and 200 in Chromium and WebKit, all 3 languages
  - [x] Code (2026-11-05): name 100, email 254, message 5,000 characters max, in the form
        (`maxLength`) and the route (`src/lib/contact-limits.ts`); non-text fields rejected. The
        route now sends visitors only a short code; the form always shows its own translated
        text. Details (missing settings, Resend's reply) go to the Vercel log as `[contact] ...`.
        Tested: 7 bad or honeypot requests to the route, and the form with simulated 429, 400,
        500, 200 in Chromium and WebKit, en, ru, uz
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
  - [x] Posts: the preview build of `3f8ed77` (2026-11-05) generated the 3 post pages, so the
        Notion variables work on Preview. Build log: no errors or warnings
  - [x] Photos and posts on sagdi.com right after go-live (2026-11-05): home HTML has 80 R2 photo
        addresses and no sample frames; Writing lists the 3 posts
  - [x] Photos: open home on the preview. The build log can't show it (a failure falls back to
        the sample frames quietly). Replaced by the sagdi.com check on the line above
  - Headless checks on the preview need a "Protection Bypass for Automation" secret, and the
    project has none. `vercel curl` would create one in the project settings: only with
    Sagdi's yes

### 4. Domain

- [x] `https://www.sagdi.com` showed a security warning (expired `*.sagdi.com` certificate from an
      older setup; www wasn't in the Vercel project). Sagdi added `www.sagdi.com` in Vercel
      2026-11-05: it now redirects (308) to `https://sagdi.com/` with its own certificate, valid
      until 2027-02-03 (checked)
- [x] `https://sagdi.com`: valid certificate until 2027-01-19 (auto-renew on), http redirects to
      https, HSTS on

### 5. Real devices and real services (on the preview, or right after go-live)

Sagdi checked the site on his phone over the local network (`npm run dev`, 2026-11-05). That
covers how pages look and behave on a real phone. It can't cover what only exists on Vercel:
analytics data, Vercel's env vars, and a real email. Those can be checked on a preview, or in the
first minutes after go-live, since Instant Rollback undoes a bad deploy in seconds.

- [ ] iPhone Safari, Android Chrome, Brave on iPhone: every page, light and dark, en, ru, uz.
      Partly done on the local network; one pass on the deployed site after the latest changes
      **(you)**
- [ ] Home carousel on a phone: the first photos show fast, swiping loads the rest, the video plays
- [ ] Frosted glass on the dock and top pill on a real iPhone (headless WebKit draws no blur)
- [ ] Contact form: a real email arrives, subject "sagdi.com: New message from ..." **(preview)**
- [x] Moved to Later (C) by Sagdi, 2026-11-05: "okay for now". Inbox the contact form sends to
      (`CONTACT_TO_EMAIL`). Checked 2026-11-05: the sender
      (`CONTACT_FROM_EMAIL`) is on `resend.dev`, Resend's test address, and no domain of yours
      has Resend's DNS records. With that sender Resend only delivers to the email of your Resend
      account ([Resend](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain)).
      So either:
  - set `CONTACT_TO_EMAIL` to the email you log in to Resend with, or
  - verify `sagdi.com` in Resend (Resend → Domains → Add → put the DNS records it shows into
    GoDaddy), then set `CONTACT_FROM_EMAIL` to an address on it, e.g. `hello@sagdi.com`. Then any
    `CONTACT_TO_EMAIL` works, and Subscribe can email people later (with `resend.dev` it can only
    ever reach you).
  - Where: Vercel → sagdi-site → Settings → Environment Variables → edit → redeploy (a changed
    variable only applies to the next deployment) **(you)**
  - Sagdi decided 2026-11-05: verifying `sagdi.com` in Resend is Later (C). So for go-live,
    `CONTACT_TO_EMAIL` must be your Resend login email **(you)**
- [ ] Link previews in Telegram and LinkedIn, en and ru. Preview URLs need a login, so bots can't
      read them: check on sagdi.com right after go-live **(go-live)**

### 6. Content: your own finish line (from the old status doc)

The old status doc said "zero sample chips, then go live". Zero sample chips: done (0 on all 36
pages in en, ru, uz). Decide for each below: blocker or Later **(you)**

- [x] Product texts: Sagdi decided 2026-11-05 they are enough for go-live. The open ones moved to
      Later (C). The Uzbek text of The Ultimate Guide to Product Management replaced with his words
      the same day
- [x] Search text per page (`meta.pages.*` in `messages/*.json`): written 2026-11-05 at Sagdi's
      request for Building, Writing, World and Work in en, ru, uz. Each title says what the page
      is, separate from the page heading; each description sums up what is on the page and is
      under 160 characters. Checked in the dev server and a production build: title, description,
      link-preview and Twitter text match on all 12 pages; page headings unchanged. Home
      (`meta.default`) not touched
- [x] ru and uz: the open judgment calls (Cyrillic name, ты/вы split, slogan) and the native Uzbek
      proofread. Sagdi OK'd them as they are (2026-11-05)
- [x] Work page in ru and uz: Sagdi OK'd it as it is (2026-11-05), including the labels that stay in
      English ("Product opportunities", "Collaboration", "Certified")
- [x] Photo alt text: written 2026-11-05 for all 20 home items (19 photos, 1 video), English, in
      `photos-src/home/set.json` (photo manager's file, order untouched; backup of the old file in
      the session scratch folder). Sagdi OK'd them 2026-11-05. One alt per photo, so ru and uz pages
      show the English alt
  - [ ] Live only after Publish in the photo manager **(you)**
- [x] Subscribe: kept on the site, emails are saved (see D). Text changed with Sagdi's yes
      (2026-11-05): hint "No spam, just new posts." (ru "Без спама, только новые записи.",
      uz "Spam yoʻq, faqat yangi maqolalar."), confirmation "You're on the list ✓" (ru "Ты в
      списке ✓", uz "Roʻyxatdasiz ✓"). Checked at 390 in en, ru, uz, light and dark

### 7. Speed, SEO and errors (production build, headless Chromium + WebKit, 2026-11-05)

- [x] Home: first photo at 1.6 s on a slow phone connection (was 5.8 s), score 99; other pages
      about 1.5 s; layout shift 0.033 at most (Google's limit is 0.1). Commit `b6e6de8`
- [x] SEO: own canonical on every page; hreflang en, ru, uz, x-default on every page and each links
      back; `<html lang>` right; sitemap has 33 entries (30 pages in 3 languages + 3 posts; it
      was 36 until Work was taken out, next item); `robots.txt`; structured data (Person,
      WebSite, CreativeWork, BlogPosting with image); preview image per language
- [x] Work page kept out of Google (Sagdi's call, 2026-11-05): `noindex, follow` on `/work`,
      `/ru/work`, `/uz/work`, and left out of the sitemap. `robots.txt` still allows it, because
      Google has to read the noindex. Link previews still work. The old live `/contact`
      (indexable today) redirects there, so Google drops it too, the next time it visits it
      after go-live. The old `/about` used to redirect there as well; it now goes to home
      (Sagdi, 2026-11-05), so it keeps its place in Google. Checked in the dev server and a production build: noindex on
      the 3 Work pages only, every other page still `index, follow`
- [x] Old live URLs (`/blog`, `/blog/:slug`, `/about`, `/contact`, `/projects`, `/hub`, ru and uz
      too) reach the new page in one redirect (local build). `/about` → home since 2026-11-05
      (was Work). Re-checked that day in a production build: all 18 (en, ru, uz) reach a 200
      page in one redirect
- [x] 404 page in all 3 languages, status 404, inside the site shell
- [x] iPhone home-screen icon loads (was 404), commit `9490949`
- [x] Work page no longer slides sideways at 390 and 1280
- [x] Blog post lists show bullets (open in the old status doc, fixed since)

---

## B. Go-live steps, in order

1. Clear section A. At go-live (2026-11-05, Sagdi: "just push to prod") the preview look was still
   open: photos on the preview, the phone pass, analytics on Preview. Those are checked on
   sagdi.com right after go-live instead (step 5).
2. Push `rewamp2026` to GitHub (it is 10+ commits ahead). Vercel builds a preview; run every
   **(preview)** item on it. Done 2026-11-05 on Sagdi's "push": GitHub refused twice with
   "remote: fatal error in commit_refs" (its status page was green), the third try went through.
   Preview of `3f8ed77` is Ready (Vercel → sagdi-site → Deployments; opening it needs a Vercel
   login).
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
   - Done 2026-11-05, names as Sagdi said ("make current branch main, and main rename to
     pre-nov-2026-version"). Step 3.2 is commit `97246b4` on `pre-nov-2026-version`: only
     `legacy/README.md` and `legacy/transition_todo_delete_after` (the other 50 legacy files were
     checked identical to that branch's own files; 5 macOS `.DS_Store` files left out). Step 3.4 is
     this commit on `main`: `legacy/` deleted (57 files); the 3 packages removed from
     `package.json` and the lock (10 lock entries gone, no other version changed); `legacy`
     dropped from `tsconfig.json`, `eslint.config.mjs`, `.prettierignore`; CLAUDE.md updated.
     Checked in a scratch copy with a fresh `npm ci`: typecheck, lint, build (53 static pages),
     search tags and noindex, all 18 old addresses, 40 Chromium and 40 WebKit runs with no errors
     besides the two Vercel-only scripts (WebKit needed a longer wait on `/writing/pspo`: the
     post's image from Notion's S3 is slow from here)
4. Push. `main` on GitHub fast-forwards (checked: the old `main` is fully inside this branch's
   history, so no force push). Production deploys. Also push `pre-nov-2026-version`. Order on
   2026-11-05: `pre-nov-2026-version` first, then `main`.
   - Keep the go-live deployment as the latest production deployment until Sagdi confirms the
     site: on Hobby, Instant Rollback only goes back one deployment, so another push to `main`
     would make the old site unreachable by rollback
5. Right after: sagdi.com loads; old URLs redirect; `sitemap.xml` and `robots.txt` load; Web
   Analytics and Speed Insights show data; Telegram and LinkedIn previews; Google Search Console:
   submit the sitemap and check the en/ru/uz pairs. Optional: to hide the old contact page
   sooner than Google's next visit, Search Console → Removals → `https://sagdi.com/contact`
   (plus `/ru/contact` and `/uz/contact`) **(you)**
   - [x] Checked on sagdi.com 2026-11-05, production deployment of `cf129b0` (Ready, build log
         clean, 53 static pages, 3 posts): every page 200 in en, ru, uz with the new titles;
         Work `noindex, follow`, the rest `index, follow`; sitemap 33 entries, robots.txt;
         all 18 old addresses reach a 200 page in one redirect (`/about` → home); www → sagdi.com;
         security headers on, no `X-Powered-By`; real photos and 3 posts; form routes answer bad
         input with 400 (no email sent, nothing saved); 40 WebKit runs clean; 40 Chromium runs
         clean apart from the analytics script the test blocked on purpose. Layout shift under
         0.1 everywhere (worst 0.057: Russian home, phone, first visit; see Later)
   - [ ] Still yours: the phone pass on sagdi.com, a real visit in Vercel Analytics, Telegram and
         LinkedIn previews, Search Console (sitemap, optional Removals), subscribe once and look
         in Resend → Contacts (D) **(you)**
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
- [ ] Product texts (moved from A.6 on 2026-11-05): ReguSelf, Pomodoro Focus Dock, Screenshots
      Processor (to be replaced by the YouTube transcript tool: name, status, link), finKeep (body
      repeats the tagline). Personal OS longer text drafted, waiting for your approval
- [ ] Verify `sagdi.com` in Resend (moved from A.5 on 2026-11-05): Resend → Domains → Add → DNS
      records into GoDaddy, then `CONTACT_FROM_EMAIL` on sagdi.com. Needed before Subscribe can
      email anyone but you
- [ ] Home, 2026-11-06: card renamed "In progress / testing" (ReguSelf shown, Personal OS and
      YouTube CC skill slide open under a chevron, with "See all projects →" to Projects) and the
      photo label renamed "Through my lens". On phones, tapping SAGDI in the top pill also opens
      the ⋮ menu. The ru and uz lines are my translations of your English: look them over **(you)**
- [ ] Contact inbox (moved from A.5 on 2026-11-05, Sagdi: "okay for now"): `CONTACT_TO_EMAIL` has
      to be your Resend login email while the sender is on `resend.dev` (or verify sagdi.com, line
      above). If it isn't, Resend refuses every message and visitors see the form's error text
      ("Try again, or reach me on LinkedIn")

Suggested (move up, keep or drop):

- [ ] Russian home on a phone, first visit: the text shifts a little when the Russian font
      arrives (layout shift 0.057 on sagdi.com, 2026-11-05; Google's limit is 0.1, so it passes).
      Seen in the "Currently" card (renamed "In progress / testing" on 2026-11-06) and the heading

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

## D. Subscribe: plan (researched 2026-11-05)

**Done first (2026-11-05): emails are saved.** The band posts the address to `/api/subscribe`
(`src/app/api/subscribe/route.ts`), which saves it as a Resend contact (`POST /contacts`). Nothing
is emailed. Honeypot field + the `/api/` rate-limit rule guard it. Optional `RESEND_SEGMENT_ID`
env var: the segment new contacts join (without it they land in Resend → Contacts only). The band
shows its confirmation line either way; failures go to the Vercel log as `[subscribe] ...`.
Tested locally with every request answered by the test (nothing reached Resend).

- [ ] After deploy: subscribe once with your own email, then check Resend → Contacts. If it isn't
      there, the Vercel log shows why. My understanding is that an API key created with "sending
      access" only can't create contacts; then make a "full access" key **(you)**
- [ ] Before the first newsletter: people who signed up before double opt-in existed get one
      "confirm you want this" email first

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

You do once: verify `sagdi.com` in Resend (needed to email anyone but you, see section 5), create
the segment, set the unsubscribe page in Resend, and add one secret env var in Vercel. Code: two small API routes, success and error text in en, ru, uz, remove the prototype
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
- Full audit write-up (2026-11-05): a private page in Sagdi's Claude account. Not linked here,
  because this repo is public
