# Setup Guide

Everything you need to get InvisibleWatts running locally from scratch.

---

## Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9 (`npm install -g pnpm`)
- A [Supabase](https://supabase.com) project (free tier works)
- A [Groq](https://console.groq.com) API key (free)

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
GROQ_API_KEY=<from console.groq.com>
```

> `GROQ_API_KEY` is **server-side only** — never prefix it with `NEXT_PUBLIC_`.
> The `/api/status` endpoint in the app reflects whether the key is present (shown as **Status: OK / Down** in the top navbar).

---

## Database Setup

In your **Supabase Dashboard → SQL Editor**, run the full contents of [`supabase/schema.sql`](supabase/schema.sql).

This creates:
- 10 tables with Row-Level Security policies
- A `handle_new_user()` trigger that seeds `profiles`, `user_preferences`, and 4 placeholder `devices` rows on every new signup

**Disable email confirmation** for local development:
Supabase Dashboard → Authentication → Providers → Email → turn off **Confirm email**.

### Schema overview

```
profiles           — user identity (full_name, email)
user_preferences   — daily kWh targets, notification flags
devices            — placeholder device registry
usage_entries      — digital activity records (device · hours · activity type)
ai_analysis        — Groq results (CO₂ estimate + recommendations JSONB)
activity_events    — system event log
hourly_readings    — kW per hour  (demo / legacy)
daily_readings     — kWh per day  (demo / legacy)
monthly_readings   — kWh per month (demo / legacy)
category_breakdown — kWh by category (demo / legacy)
```

All tables use `auth.uid() = user_id` RLS — users can only ever read or write their own rows.

---

## Running the App

```bash
pnpm install
pnpm dev          # → http://localhost:3000
```

```bash
pnpm build        # Production build
pnpm start        # Start production server
```

---

## Project Structure

```
invisiblewatts/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts   Groq AI endpoint (image extraction + CO₂ analysis)
│   │   └── status/route.ts    Health check → { ok: boolean }
│   ├── auth/actions.ts        signIn · signUp · signOut server actions
│   ├── demo/actions.ts        toggleDemoMode (sets iw_demo_mode cookie)
│   ├── settings/actions.ts    updateProfile · updateGoals · updateNotifications
│   ├── layout.tsx             Root layout — Inter font, ThemeProvider, metadata
│   ├── page.tsx               Landing page (redirects logged-in users to /dashboard)
│   └── [page]/                dashboard · upload · analytics · ai-insights
│                              activity · reports · settings · help · terms
│
├── components/
│   ├── kokonutui/             App shell + all page-level client components
│   │   ├── layout.tsx         Fixed sidebar + topnav shell
│   │   ├── sidebar.tsx        Left nav + Demo Mode toggle
│   │   ├── top-nav.tsx        Header (breadcrumb, Status badge, avatar)
│   │   ├── dashboard.tsx      Dashboard server component
│   │   ├── content.tsx        Dashboard charts (client)
│   │   ├── upload-content.tsx File dropzone + manual entry table
│   │   └── ...                analytics · activity · reports · settings · ai-insights
│   ├── landing-navbar.tsx     Animated resizable landing navbar (client)
│   ├── notifications-modal.tsx Bell dialog
│   └── ui/                    shadcn/ui primitives + resizable-navbar
│
├── hooks/
│   ├── use-mobile.ts          useIsMobile() — 768px breakpoint
│   └── use-toast.ts           Toast state manager
│
├── lib/
│   ├── utils.ts               cn() = clsx + tailwind-merge
│   ├── demo-data.ts           Static constants for Demo Mode
│   └── supabase/
│       ├── client.ts          createBrowserClient (use in client components)
│       ├── server.ts          createServerClient (use in server components / actions)
│       └── types.ts           TypeScript types for all 10 DB tables
│
├── public/
│   └── logo.svg               App logo
│
├── chrome-extension/          Standalone MV3 browser extension (see below)
├── supabase/schema.sql        Full DB schema + RLS + signup trigger
├── middleware.ts              Auth guard + public route allowlist
├── tailwind.config.js
├── next.config.mjs
└── CLAUDE.md                  Full architecture reference for LLM assistants
```

---

## Chrome Extension

The extension is an independent MV3 package in `/chrome-extension`. It does **not** share sessions with the web app and stores all data locally in `chrome.storage.local`.

```
chrome-extension/
├── manifest.json          MV3 — tabs, storage, activeTab, idle permissions (v1.1.0)
├── background.js          Service worker: tab tracking, CO₂ + kWh estimation, 7-day storage
├── content.js             Video detection + high-impact site warning banner
├── popup.html/css/js      Ring meter, 2×2 metric grid (kWh · data · time · ₹ cost), site stats
├── analytics.html/css/js  7-day analytics: CO₂ + ₹ energy cost per site and weekly totals
└── icons/
    ├── create-icons.js    PNG icon generator (Node.js, zero external deps)
    │                      Run: node icons/create-icons.js
    ├── logo.svg           Matches /public/logo.svg
    └── icon16/48/128.png
```

### Loading in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `chrome-extension/` folder

### Regenerating icons

```bash
cd chrome-extension/icons
node create-icons.js
```
