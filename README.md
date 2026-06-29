# TaxIQ

Bilingual (Azerbaijani / English) Finance, Tax & Accounting news and announcements platform. See `CLAUDE.md` for the full technical specification.

## Stack

Next.js 14+ (App Router) · TypeScript · Tailwind CSS · shadcn/ui primitives · TipTap · Firebase (Auth, Firestore, Storage) · Groq · next-intl · next-themes.

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev
```

### Required environment variables (`.env.local`)

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase Console → Project settings → General → Your apps → Web app config |
| `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY` | Firebase Console → Project settings → Service accounts → Generate new private key |
| `GROQ_API_KEY`, `GROQ_MODEL` | [Groq Console](https://console.groq.com) |
| `CRON_SECRET` | Any random string; also set as a header when calling `/api/cron/publish-scheduled` |
| `NEXT_PUBLIC_SITE_URL`, `DEFAULT_LOCALE` | App-level config |

`FIREBASE_ADMIN_PRIVATE_KEY` must be quoted with `\n` escapes preserved (see `.env.example`).

### Seed categories

The app needs the three core categories (Maliyyə/Finance, Vergi/Tax, Mühasibatlıq/Accounting) plus a News catch-all:

```bash
npm run seed:categories
```

### Deploy Firestore/Storage rules and indexes

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage --project <your-project-id>
```

## Project structure

- `src/app/[locale]/*` — public, locale-prefixed routes (`/az`, `/en`).
- `src/app/admin/*` — protected editorial console (session cookie + role checked in `src/lib/auth-admin-guard.ts`).
- `src/app/api/ai/*` — Groq-backed AI endpoints (chat, summarize, assist, translate, seo). All server-side only.
- `src/app/api/cron/publish-scheduled` — Vercel Cron target; protected by `CRON_SECRET` bearer token.
- `src/lib/repositories/*` — the only code that talks to Firestore directly.
- `src/lib/firebase/{client,admin}.ts` — Firebase SDK wrappers (client vs Admin SDK).
- `src/lib/groq.ts` — Groq client wrapper, including the Azerbaijani grammar system-prompt instruction.
- `firestore.rules`, `storage.rules`, `firestore.indexes.json` — security rules and required composite indexes.

## Deploy

1. Push to GitHub, import into Vercel, set the env vars above in the Vercel project settings.
2. `vercel.json` already configures the `/api/cron/publish-scheduled` cron (every 5 minutes).
3. Deploy Firestore/Storage rules and indexes as shown above.
4. `main` → production; PRs → preview deploys.
