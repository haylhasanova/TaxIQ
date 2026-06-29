# Technical Specification — FinNews Platform

> **Purpose of this document.** This is the authoritative build specification for an AI‑powered **Finance, Tax & Accounting news and announcements platform**. It is written to be read by **Claude Code** directly from the GitHub repository. Treat this file as the single source of truth: when implementation details are ambiguous, prefer the choices stated here, and only deviate with a clear, documented reason.

---

## 1. Product Overview

### 1.1 What we are building
A bilingual (Azerbaijani / English) editorial platform where an editorial team publishes **news, announcements, and analysis** in three domains:

- **Finance** (markets, banking, corporate finance, personal finance)
- **Tax** (`Vergi`) — tax law changes, deadlines, official rulings
- **Accounting** (`Mühasibatlıq`) — standards (IFRS/local GAAP), reporting, practice notes

The product has **two surfaces**:

1. **Public site (reader surface)** — a fast, SEO‑optimized, blog/magazine‑style news site.
2. **Admin console (editorial surface)** — authenticated dashboard for authoring, scheduling, and managing content with AI assistance.

### 1.2 Core principles
- **SEO and speed first.** News content must be server‑rendered and indexable. Use SSG/ISR wherever possible.
- **AI is woven throughout**, not bolted on: AI‑assisted writing for editors, AI summaries and a chatbot for readers.
- **Bilingual by design.** Every piece of content and every UI string exists in **Azerbaijani (default)** and **English**. Azerbaijani copy must be grammatically correct (see §12).
- **Editorial trust.** Clean separation of draft / scheduled / published states; nothing goes live by accident.

---

## 2. Technology Stack (fixed decisions)

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** | React Server Components, route handlers, ISR. |
| Language | **TypeScript (strict)** | `strict: true` in `tsconfig`. No `any` without justification. |
| Styling | **Tailwind CSS** + CSS variables for theming | Montserrat as the primary typeface. |
| UI primitives | **shadcn/ui** (Radix under the hood) | Accessible components; restyle to match design tokens in §8. |
| Rich text editor | **TipTap** (ProseMirror) | Required. See §6. |
| Auth | **Firebase Authentication** | Email/password + Google provider. Role via custom claims. |
| Database | **Cloud Firestore** | Primary datastore. Schema in §5. |
| File storage | **Firebase Storage** | Images and media. Already enabled by the owner. |
| Serverless logic | **Next.js Route Handlers** on Vercel | All secret‑bearing calls (Groq, admin writes) run server‑side. |
| Scheduling | **Vercel Cron** → route handler | Publishes scheduled posts. See §7. |
| AI provider | **Groq API** | Key provided by owner; server‑side only. See §9. |
| i18n | **next-intl** | AZ default, EN secondary. See §11. |
| Theme | **next-themes** | Dark / light, system aware. See §8.4. |
| Forms / validation | **react-hook-form** + **zod** | Shared zod schemas validate client and server. |
| Hosting | **Vercel** | Preview deploys per PR; production on `main`. |
| Source control | **GitHub** | This repo. |

> Do not introduce a different ORM, CMS, or auth system. Do not move secrets to the client. Do not replace Firestore with another DB.

---

## 3. High-Level Architecture

```
                         ┌──────────────────────────────────────┐
                         │              Vercel (Next.js)         │
   Reader (browser) ───▶ │  Public routes  (RSC / ISR / SSG)     │
                         │  Admin routes   (protected, dynamic)  │
   Editor (browser) ───▶ │  Route handlers (/api/*)              │
                         │   ├─ /api/ai/*      → Groq (server)   │
                         │   ├─ /api/cron/*    → scheduler        │
                         │   └─ /api/admin/*   → privileged writes │
                         └───────────┬──────────────┬────────────┘
                                     │              │
                         Firebase Admin SDK   Groq API (LLM)
                                     │
            ┌────────────────────────┼─────────────────────────┐
            │            │                       │              │
       Firebase Auth  Firestore             Firebase Storage   (Vercel Cron)
       (users/roles)  (content)             (images/media)
```

**Two Firebase access paths:**
- **Client SDK** (browser): read public content, reader auth, reads scoped by security rules.
- **Admin SDK** (server, in route handlers): all privileged writes (publishing, role changes, scheduled publishing). Never trust the client for these.

---

## 4. Repository Structure

```
/
├─ CLAUDE.md                      # this file
├─ README.md                      # setup + run instructions
├─ .env.example                   # all required env vars (no real values)
├─ next.config.mjs
├─ tailwind.config.ts
├─ tsconfig.json
├─ middleware.ts                  # locale + admin route protection
├─ src/
│  ├─ app/
│  │  ├─ [locale]/                # public, locale-prefixed routes
│  │  │  ├─ page.tsx              # home
│  │  │  ├─ category/[slug]/page.tsx
│  │  │  ├─ article/[slug]/page.tsx
│  │  │  ├─ announcements/page.tsx
│  │  │  ├─ search/page.tsx
│  │  │  └─ about/page.tsx
│  │  ├─ admin/                   # protected editorial console
│  │  │  ├─ layout.tsx            # auth guard + shell
│  │  │  ├─ page.tsx              # dashboard
│  │  │  ├─ articles/…            # list, new, edit
│  │  │  ├─ announcements/…
│  │  │  ├─ categories/…
│  │  │  ├─ media/…               # media library
│  │  │  └─ users/…               # role management (super-admin)
│  │  └─ api/
│  │     ├─ ai/{assist,summarize,chat,translate,seo}/route.ts
│  │     ├─ admin/{articles,publish,users}/route.ts
│  │     └─ cron/publish-scheduled/route.ts
│  ├─ components/                 # ui + feature components
│  ├─ lib/
│  │  ├─ firebase/{client.ts,admin.ts}
│  │  ├─ groq.ts                  # Groq client wrapper
│  │  ├─ repositories/            # Firestore data access layer
│  │  └─ validators/              # zod schemas (shared)
│  ├─ i18n/                       # next-intl config + messages
│  │  └─ messages/{az.json,en.json}
│  ├─ types/                      # shared TS types
│  └─ styles/globals.css
```

> Keep all Firestore reads/writes inside `lib/repositories/*`. UI and route handlers call repositories, never Firestore directly. This keeps the data layer swappable and testable.

---

## 5. Data Model (Firestore)

Firestore is schemaless, but the app enforces shapes via zod. Use these collections.

### 5.1 Bilingual field convention
Localized text is stored as an object: `{ az: string, en: string }`. Example: `title: { az: "...", en: "..." }`. Slugs are stored per locale: `slug: { az, en }` to allow clean localized URLs.

### 5.2 `users`
| Field | Type | Notes |
|---|---|---|
| `uid` | string | matches Firebase Auth UID (doc id = uid) |
| `email` | string | |
| `displayName` | string | |
| `photoURL` | string? | |
| `role` | `'super_admin' \| 'editor' \| 'author' \| 'reader'` | mirrored into Auth **custom claims** |
| `createdAt` / `updatedAt` | Timestamp | |

Roles & permissions:
- **super_admin** — everything, incl. user role management and category management.
- **editor** — create/edit/publish/schedule any content.
- **author** — create/edit own drafts; cannot publish (submits for review).
- **reader** — public + personalized features (saved articles, comment if enabled).

### 5.3 `articles`
| Field | Type | Notes |
|---|---|---|
| `id` | string | doc id |
| `title` | `{az,en}` | |
| `slug` | `{az,en}` | unique per locale; generated from title, editable |
| `excerpt` | `{az,en}` | short summary for cards / meta description |
| `content` | `{az,en}` | TipTap JSON (store as JSON, not HTML) |
| `contentHtml` | `{az,en}` | server-rendered HTML cache for fast public render |
| `coverImage` | `{ url, alt:{az,en}, width, height }` | from Storage |
| `categoryId` | string | ref → `categories` |
| `tags` | string[] | |
| `authorId` | string | ref → `users` |
| `status` | `'draft' \| 'in_review' \| 'scheduled' \| 'published' \| 'archived'` | |
| `publishAt` | Timestamp? | required when `scheduled` |
| `publishedAt` | Timestamp? | set when actually published |
| `featured` | boolean | drives hero placement |
| `readingMinutes` | number | computed |
| `views` | number | incremented atomically |
| `aiSummary` | `{az,en}`? | cached AI summary (see §9.3) |
| `seo` | `{ metaTitle:{az,en}, metaDescription:{az,en}, ogImage:string }` | |
| `createdAt` / `updatedAt` | Timestamp | |

**Indexes (composite):**
- `status` + `publishedAt desc` (public feeds)
- `categoryId` + `status` + `publishedAt desc`
- `featured` + `status` + `publishedAt desc`
- `status` + `publishAt asc` (scheduler query)

### 5.4 `announcements`
Lighter-weight than articles (deadlines, official notices, events).
| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `title` | `{az,en}` | |
| `body` | `{az,en}` | rich text (TipTap JSON) |
| `type` | `'deadline' \| 'event' \| 'notice' \| 'regulation'` | |
| `severity` | `'info' \| 'warning' \| 'critical'` | drives banner color |
| `effectiveDate` | Timestamp? | e.g. tax deadline date |
| `status` | same enum as articles | supports scheduling |
| `publishAt` / `publishedAt` | Timestamp? | |
| `pinned` | boolean | sticky on top |
| `createdAt`/`updatedAt` | Timestamp | |

### 5.5 `categories`
| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `slug` | `{az,en}` | |
| `name` | `{az,en}` | e.g. `{az:"Vergi", en:"Tax"}` |
| `description` | `{az,en}` | |
| `accentColor` | string | hex; used in UI badges |
| `order` | number | nav ordering |

Seed three categories on first run: **Maliyyə / Finance**, **Vergi / Tax**, **Mühasibatlıq / Accounting** (plus an optional **Xəbərlər / News** catch-all).

### 5.6 `media`
| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `url` | string | Storage download URL |
| `path` | string | Storage path |
| `type` | string | mime |
| `width`/`height` | number | |
| `alt` | `{az,en}` | |
| `uploadedBy` | string | uid |
| `createdAt` | Timestamp | |

### 5.7 `subscribers` (newsletter, optional but scaffold it)
`{ email, locale, confirmed:boolean, createdAt }`

### 5.8 `chatSessions` (optional analytics for chatbot)
`{ id, messages: [{role, content, ts}], locale, createdAt }` — store only if owner enables analytics; do not store PII.

---

## 6. Rich Text Editor (Admin) — **required**

Use **TipTap**. Persist content as **ProseMirror JSON** in Firestore (`content`/`body`), and also render to sanitized HTML server-side for the public page (`contentHtml` cache).

**Required extensions / features:**
- Headings (H2–H4), bold, italic, underline, strikethrough, blockquote, code, code block.
- Ordered / unordered lists, task lists.
- Links (with `rel="nofollow noopener"` on external).
- **Images** — upload to Firebase Storage, insert with alt text; drag‑and‑drop and paste support; client‑side resize/compression before upload.
- Tables (important for tax rate tables, accounting schedules).
- Callout / notice blocks (custom node) for highlighting deadlines or warnings.
- Embeds: YouTube/Vimeo, and a generic “quote card”.
- Horizontal rule, hard breaks.
- **Slash command menu** (`/`) and a floating bubble toolbar.
- **Autosave** drafts every ~5s to Firestore (debounced) with a visible “Saved” indicator.
- **Word/character count + reading time**.
- **AI assist toolbar** docked in the editor (see §9.2).

**Sanitization:** never render raw HTML from the editor without sanitizing. Use a server-side sanitizer (e.g. `sanitize-html` / DOMPurify on the server) before caching `contentHtml`.

---

## 7. Publishing & Scheduling

### 7.1 States and transitions
```
draft ──submit──▶ in_review ──approve──▶ (publish now | schedule)
draft ─────────────────────────────────▶ (publish now | schedule)
scheduled ──(cron at publishAt)──▶ published
published ──▶ archived
```

### 7.2 Scheduling mechanism
- When an editor schedules, set `status='scheduled'` and `publishAt`.
- **Vercel Cron** calls `GET /api/cron/publish-scheduled` every 5 minutes.
- The handler (Admin SDK) queries `articles`/`announcements` where `status == 'scheduled'` and `publishAt <= now`, then flips them to `published`, sets `publishedAt`, and triggers ISR revalidation (`revalidatePath`/`revalidateTag`) for affected pages.
- Protect the cron route with a secret header (`CRON_SECRET`) checked server-side. Reject calls without it.

### 7.3 Editorial UX
- A clear status pill on every list row.
- A calendar/schedule picker (date + time, timezone = `Asia/Baku`).
- “Publish now”, “Schedule”, “Save draft”, “Submit for review” actions, scoped by role.
- Confirmation modal before publish; toast feedback (“Published”, not “Submit succeeded”).

---

## 8. Design System

### 8.1 Direction
Editorial **blog / news‑magazine** aesthetic inspired by the reference (*Adventure Today – News Website*, Denis Alwan / ItWorks Agency): a strong **hero featured story**, clear category navigation, a clean card grid, generous whitespace, confident typographic hierarchy. The vibe is **trustworthy financial editorial** — precise, calm, not flashy.

### 8.2 Typography
- **Montserrat** is the primary family (load via `next/font/google`, subset latin + latin-ext for AZ characters like ə, ş, ç, ğ, ö, ü, ı).
- Type roles:
  - **Display / headlines** — Montserrat 700/800, tight tracking, large hero size.
  - **Body** — Montserrat 400/500, comfortable line-height (1.7) for long-form reading.
  - **Utility / eyebrow / metadata** — Montserrat 600, uppercase, letter-spaced, small.
- Define a fluid type scale (clamp) so headlines scale on mobile.

### 8.3 Color tokens (CSS variables; both themes)
Define as HSL custom properties so theme switching is a class swap. Suggested palette (editor may refine):

```
Light:
  --bg:            0 0% 100%
  --surface:       210 20% 98%
  --text:          222 25% 12%
  --muted:         222 10% 45%
  --border:        220 14% 90%
  --primary:       222 80% 22%   /* deep navy — finance/trust */
  --accent:        160 84% 39%   /* emerald — growth/markets */
  --warning:       38 92% 50%
  --danger:        0 72% 51%

Dark:
  --bg:            222 30% 8%
  --surface:       222 24% 12%
  --text:          210 20% 96%
  --muted:         215 15% 65%
  --border:        222 20% 20%
  --primary:       210 90% 66%
  --accent:        160 70% 50%
  --warning:       38 92% 60%
  --danger:        0 72% 62%
```
Category accents come from `categories.accentColor`; keep them muted enough to remain legible on both themes.

### 8.4 Theme switching
- `next-themes` with `class` strategy. Toggle in header (sun/moon), persists, respects system preference, no flash of wrong theme (inline script / `suppressHydrationWarning`).

### 8.5 Layout — public surface
- **Header:** logo, category nav, search, language switch (AZ/EN), theme toggle, “Sign in”.
- **Home:** hero featured article (large), then a “Latest” grid (3‑col desktop / 1‑col mobile), a per‑category rail, and a pinned **announcements** strip if any critical announcement exists.
- **Article page:** breadcrumb, category badge, title, author + date + reading time, cover image, body, **“Summarize with AI”** button (§9.3), tags, related articles, share buttons.
- **Category page:** header + filtered grid + pagination/infinite scroll.
- **Announcements page:** chronological list with type/severity badges; pinned on top.

### 8.6 Layout — admin surface
- Left sidebar nav (Dashboard, Articles, Announcements, Categories, Media, Users), top bar (user menu, theme, locale).
- Dashboard: counts (published / scheduled / drafts), recent activity, upcoming scheduled list, quick “New article”.
- Data tables with search, status filter, sort, bulk actions.

### 8.7 Quality floor
Responsive to mobile, visible keyboard focus, `prefers-reduced-motion` respected, semantic landmarks, color contrast AA. Images use `next/image` with width/height to avoid layout shift.

---

## 9. AI Integration (Groq) — **required everywhere**

All Groq calls run **server-side only** in `/api/ai/*`. The key (`GROQ_API_KEY`) is never exposed to the client. Wrap Groq access in `lib/groq.ts`. Use a current Groq-hosted instruction model (e.g. a Llama 3.x instruct model); make the model id an env var (`GROQ_MODEL`) so it can be swapped. Stream responses where it improves UX (chat, assist).

> Verify the exact available Groq model ids at build time against Groq’s docs; do not hardcode a model that may be deprecated — read it from `GROQ_MODEL`.

### 9.1 Reader chatbot (`/api/ai/chat`) — required
- Floating chat widget on the public site (bottom-right), themed and bilingual.
- System prompt constrains it to the site’s domain (finance, tax, accounting) and the current locale.
- **Grounded answers:** retrieve the most relevant published articles (simple keyword/category retrieval over Firestore, or precomputed embeddings if added later) and pass excerpts as context so the bot can cite/link real articles. If it doesn’t know, it says so and suggests categories — it must not invent tax figures or legal claims.
- Stream tokens; show typing state; keep last N messages client-side; optional session logging per §5.8.
- Rate-limit per IP/session.

### 9.2 Editorial AI writing assistant (`/api/ai/assist`) — required
Available inside the TipTap editor. Actions (send selected text or full draft + action type):
- **Generate draft** from a headline/brief.
- **Improve / rewrite** selection (clarity, tone).
- **Continue writing**.
- **Shorten / expand**.
- **Fix grammar & style** — especially **Azerbaijani grammar** (see §12).
- **Suggest 5 headlines**.
- **Generate excerpt / meta description**.
- **Suggest tags & category**.
Return suggestions in a side panel; editor accepts/inserts. Never auto-overwrite without confirmation.

### 9.3 Reader “Summarize with AI” (`/api/ai/summarize`) — required
- Button on every article. On click, returns a concise 3–5 bullet summary in the **current locale**.
- Cache the result in `articles.aiSummary[locale]` so repeat requests are instant and cheap; regenerate if `updatedAt` changes.

### 9.4 AI translation helper (`/api/ai/translate`) — required for bilingual workflow
- In admin, “Translate AZ→EN” / “EN→AZ” to bootstrap the other language field. Output is a **draft** the editor must review (especially AZ grammar). Never publish machine translation silently.

### 9.5 SEO assist (`/api/ai/seo`)
- Generate `metaTitle` / `metaDescription` per locale from content.

### 9.6 Guardrails (all AI endpoints)
- Auth: assist/translate/seo require an authenticated editor/author; chat/summarize are public but rate-limited.
- Validate inputs with zod; cap input length; handle Groq errors gracefully with localized fallback messages.
- Add a visible “AI‑generated, review before publishing” note on editorial AI output, and an “AI summary may be imperfect” note on reader summaries.

---

## 10. Authentication & Authorization

- **Firebase Auth**: email/password + Google.
- On user creation, write a `users` doc with default `role='reader'`.
- **Roles via custom claims**: a super_admin action (server route, Admin SDK) sets the claim and mirrors it to the `users` doc. The app reads claims from the ID token for gating.
- **Route protection**:
  - `middleware.ts` redirects unauthenticated users away from `/admin/*`.
  - Server-side, every `/api/admin/*` handler re-verifies the ID token and role with the Admin SDK — never trust client-side role alone.
- **Firestore Security Rules** (ship a `firestore.rules` file):
  - Public can **read** documents where `status == 'published'`.
  - Drafts/scheduled readable only by the author or editors/super_admin.
  - Writes to `articles`, `announcements`, `categories`, `users.role` only via authenticated privileged users (enforce both in rules and prefer server Admin SDK for publishing).
  - `media` readable public; writable by authors+.
  - `subscribers` create allowed for anyone (email only), read restricted to editors.
- Provide matching **Storage rules**: public read for published media paths; writes restricted to authenticated authors+ with size/type limits.

---

## 11. Internationalization (AZ default / EN)

- **next-intl**, locale prefix routing: `/az/...` (default) and `/en/...`. Root `/` redirects to `/az`.
- UI strings live in `src/i18n/messages/az.json` and `en.json`. No hardcoded user-facing strings in components.
- Content is bilingual at the data layer (§5.1). If one language is missing for an article, fall back to the other with a small “translation pending” note.
- Locale switch in header preserves the current route/slug.
- Format dates/numbers with the locale (`Intl`), timezone `Asia/Baku`. Azerbaijani month/date formatting must read naturally.
- `hreflang` alternates and localized `<title>`/meta per locale for SEO.

---

## 12. Azerbaijani Language Quality (hard requirement)

The owner requires **grammatically correct Azerbaijani**. Enforce this at three levels:

1. **UI copy** in `az.json` must be reviewed for correct orthography and diacritics (ə, ı, ö, ü, ç, ş, ğ) and natural phrasing — not literal translations from English.
2. **AI prompts**: every AI endpoint that can output Azerbaijian must include an explicit instruction to use **standard literary Azerbaijani, correct grammar, suffix harmony (ahəng qanunu), and proper diacritics**, and to avoid anglicisms where a common Azerbaijani term exists.
3. **Editorial flow**: AI‑generated Azerbaijani is always a draft requiring human review before publish (see §9.2/§9.4). Provide a one‑click “Fix Azerbaijani grammar” assist action.

Keep a short `docs/azerbaijani-style.md` with preferred terminology (e.g. *Vergi*, *Mühasibatlıq*, *Maliyyə hesabatı*) so terms stay consistent across the site.

---

## 13. SEO & Performance

- Server-render/ISR public pages; revalidate on publish.
- Per-article: localized `<title>`, meta description, Open Graph + Twitter cards, canonical, `hreflang`.
- JSON-LD `NewsArticle` structured data.
- `sitemap.xml` (both locales) and `robots.txt` generated dynamically.
- RSS feed per locale (optional but scaffold).
- `next/image` for all images; lazy-load below the fold; compress on upload.
- Track `views` atomically (increment) without blocking render.
- Lighthouse targets: Performance ≥ 90, SEO ≥ 95, Accessibility ≥ 95.

---

## 14. Environment Variables (`.env.example`)

```
# Firebase (client - public)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server - secret)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Groq (server - secret)
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile   # confirm current id from Groq docs

# App
NEXT_PUBLIC_SITE_URL=
CRON_SECRET=
DEFAULT_LOCALE=az
```
> Never commit real values. Configure the same vars in Vercel project settings (and as Vercel Cron secret). `FIREBASE_ADMIN_PRIVATE_KEY` must handle escaped newlines.

---

## 15. Deployment (GitHub → Vercel → Firebase)

1. Push repo to GitHub (owner already has the repo).
2. Import into Vercel; set env vars; framework auto-detected (Next.js).
3. Configure **Vercel Cron** in `vercel.json` to hit `/api/cron/publish-scheduled` every 5 min.
4. Firebase: enable Auth providers, deploy `firestore.rules` + `storage.rules` + composite indexes (`firebase deploy --only firestore:rules,firestore:indexes,storage`).
5. `main` → production; PRs → preview deploys.
6. README documents local setup (`npm i`, `.env.local`, `npm run dev`) and the Firebase emulator suite for local dev.

`vercel.json` cron example:
```json
{ "crons": [ { "path": "/api/cron/publish-scheduled", "schedule": "*/5 * * * *" } ] }
```

---

## 16. Build Order (suggested for Claude Code)

1. **Scaffold**: Next.js + TS + Tailwind + Montserrat + shadcn/ui + next-intl + next-themes; design tokens (§8.3); base layout + header/footer; theme & locale switchers.
2. **Firebase**: client + admin SDK wrappers; auth (sign in/up, Google); `users` doc + role claims; route guards; security rules.
3. **Data layer**: zod schemas + repositories for categories, articles, announcements, media; seed categories.
4. **Public surface**: home (hero + grid), category, article page, announcements, search; SEO + sitemap + ISR.
5. **Admin surface**: dashboard, article list/editor with **TipTap** + image upload + autosave; announcements; categories; media library; users (role mgmt).
6. **Scheduling**: states, schedule picker, Vercel Cron publisher + revalidation.
7. **AI (Groq)**: `lib/groq.ts`; summarize → chat → editorial assist → translate → seo; guardrails + rate limiting + AZ grammar prompting.
8. **Polish**: accessibility, performance, Lighthouse, error/empty states, README.

---

## 17. Acceptance Checklist

- [ ] Public site renders fast, SEO-ready, AZ default with EN toggle; dark/light works with no flash.
- [ ] Montserrat used throughout, including correct AZ diacritics.
- [ ] Admin can create, edit, save draft, submit, publish, **schedule**, and archive content.
- [ ] TipTap editor supports rich formatting, **image upload to Storage**, tables, callouts, autosave.
- [ ] Scheduled posts auto-publish via Vercel Cron and pages revalidate.
- [ ] Roles enforced both in security rules and server routes; secrets never reach the client.
- [ ] Chatbot answers domain questions grounded in real published articles, bilingual.
- [ ] Editorial AI assist (draft/improve/headlines/grammar/translate) works inside the editor with review-before-publish.
- [ ] Reader “Summarize with AI” works and caches results.
- [ ] All content bilingual; Azerbaijani output is grammatically correct.
- [ ] Deployed on Vercel; Firestore + Storage rules and indexes deployed.

---

## 18. Notes & Constraints for the Implementer

- Prefer **Server Components** and route handlers; keep client components minimal (editor, chat widget, toggles, forms).
- Centralize Firestore access in repositories; centralize Groq access in `lib/groq.ts`.
- Validate everything server-side with zod even if validated on the client.
- Handle all async/AI failures with localized, friendly fallback UI — never a raw error to the reader.
- Write the README and `.env.example` so the owner can deploy without guessing.
- If a decision isn’t covered here, choose the option that best serves **reader trust, SEO, and bilingual correctness**, and note it in the README.
