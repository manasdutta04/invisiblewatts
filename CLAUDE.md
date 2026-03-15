# InvisibleWatts — LLM Context File

> This file exists so that Claude, Cursor, Copilot, or any other LLM assistant can immediately understand the full context of this project without exploring the codebase from scratch.

---

## What Is InvisibleWatts?

**InvisibleWatts is a platform that quantifies the environmental impact of digital behavior and provides insights to reduce carbon emissions from online activities.**

Core value proposition:
- Users upload screenshots of phone/laptop screen time reports (iOS Screen Time, Android Digital Wellbeing, Windows) OR manually enter their device usage data
- Advanced AI analysis extracts data from screenshots and calculates CO₂ emissions from digital activity
- AI-powered recommendations to reduce digital carbon footprint
- Reports and analytics built from real uploaded data

The concept is **"Google Analytics for Digital Carbon"** — a dashboard that makes invisible digital energy usage visible, quantifiable, and actionable.

**Current state: Functional MVP. Real Supabase auth + database. Groq AI integration for data extraction and CO₂ analysis. File upload client-side only (no storage used).**

---

## Product Vision

The platform sits at the intersection of sustainability and software. Target users are:
- Individuals who want to reduce their digital carbon footprint
- Organizations tracking Scope 3 emissions from employee digital activity
- Developers and teams wanting to measure the energy cost of their software

The data flow:
1. User uploads a screen time screenshot OR manually enters device usage (device type, time in hr/min, activity, date)
2. Groq AI vision model extracts data from screenshot → user confirms entries
3. Groq text model analyzes entries → calculates CO₂ emissions → saves structured recommendations to DB
4. Dashboard, Analytics, Reports, and AI Insights pages pull from real DB data

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15.2.6 |
| Language | TypeScript | 5 |
| Runtime | React | 19 |
| Styling | Tailwind CSS | 3.4 |
| Component library | shadcn/ui (New York, neutral base) | latest |
| UI primitives | Radix UI | full suite |
| Charts | Recharts | 2.15 |
| Dark mode | next-themes (class strategy) | latest |
| Icons | lucide-react | 0.454 |
| Font | Inter (next/font/google) | — |
| Package manager | pnpm | — |
| Dev server | Next.js + Turbopack | — |
| Database + Auth | Supabase | latest |
| AI | Groq API (meta-llama/llama-4-scout-17b-16e-instruct + llama-3.3-70b-versatile) | free tier |

---

## Architecture

### App Shell

The layout is a **fixed sidebar + top bar** shell implemented as a custom `<Layout>` component (not Next.js's `layout.tsx`):

```
┌──────────────────────────────────────────────────────┐
│  Sidebar (w-64, fixed)  │  TopNav (h-16)             │
│  ─────────────────────  │  ──────────────────────────│
│  [Logo] InvisibleWatts  │  Breadcrumb | Bell | Avatar │
│                         │  ──────────────────────────│
│  MAIN                   │                            │
│   Dashboard             │  <main>                    │
│   Upload Data           │  p-6, flex-1, overflow-auto│
│   Activity              │  bg-white dark:bg-[#0F0F12]│
│   Analytics             │                            │
│   Reports               │                            │
│                         │                            │
│  AI & INSIGHTS          │                            │
│   AI Insights           │                            │
│  ─────────────────────  │                            │
│  DEMO                   │                            │
│   [Try Demo / Demo: On] │                            │
│  ─────────────────────  │                            │
│   Settings              │                            │
│   Help & Support        │                            │
└──────────────────────────────────────────────────────┘
```

- `components/kokonutui/layout.tsx` — outer shell (`div.flex.h-screen`)
- `components/kokonutui/sidebar.tsx` — left nav with Demo Mode toggle button
- `components/kokonutui/top-nav.tsx` — top bar; breadcrumb auto-generated from `usePathname()` via `getPageLabel()` switch
- Mobile: sidebar slides in from the left with a hamburger toggle and overlay backdrop

### Demo Mode

A cookie-based feature (`iw_demo_mode=1`) that overlays static hardcoded data on all data pages so users can explore the UI without uploading anything.

- Toggle: sidebar "Demo" section button → calls `toggleDemoMode()` server action (`app/demo/actions.ts`)
- Server action: sets/clears cookie + `revalidatePath("/", "layout")`
- Server components: check `cookies().get("iw_demo_mode")?.value === "1"` at page level
- Sidebar reads current state client-side via `document.cookie`
- Static data lives in `lib/demo-data.ts`
- When active: amber banner shows on each page; sidebar button turns violet with "ON" badge

### Routing

All routes live under `app/` using the Next.js App Router:

| Route | File | Type | Notes |
|---|---|---|---|
| `/` | `app/page.tsx` | Server | Landing page + redirect to `/dashboard` if logged in |
| `/login` | `app/login/page.tsx` | Client | Standalone (no Layout) |
| `/signup` | `app/signup/page.tsx` | Client | Standalone (no Layout) |
| `/dashboard` | `app/dashboard/page.tsx` | Server | → `<Dashboard />` server component |
| `/upload` | `app/upload/page.tsx` | Server | → `<UploadContent />` client component |
| `/analytics` | `app/analytics/page.tsx` | Server | → `<AnalyticsContent />` client component |
| `/ai-insights` | `app/ai-insights/page.tsx` | Server | → `<AiInsightsContent />` client component |
| `/activity` | `app/activity/page.tsx` | Server | → `<ActivityContent />` client component |
| `/reports` | `app/reports/page.tsx` | Server | → `<ReportsContent />` client component |
| `/settings` | `app/settings/page.tsx` | Server | → `<SettingsContent />` client component |
| `/help` | `app/help/page.tsx` | Client | Static content |
| `/terms` | `app/terms/page.tsx` | Client | Static content |

Every route has a co-located `loading.tsx` skeleton file.

---

## File Structure

```
invisiblewatts/
├── app/
│   ├── layout.tsx                  # Root layout: Inter font, ThemeProvider, metadata
│   ├── globals.css                 # Tailwind directives + CSS custom properties
│   ├── page.tsx                    # Landing page; "Load in Chrome" → GitHub releases
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts            # POST: Groq AI — image extraction or CO₂ analysis
│   ├── auth/
│   │   └── actions.ts              # signIn, signUp, signOut server actions
│   ├── demo/
│   │   └── actions.ts              # toggleDemoMode server action (sets iw_demo_mode cookie)
│   ├── dashboard/
│   ├── upload/
│   ├── analytics/
│   ├── ai-insights/
│   ├── activity/
│   ├── reports/
│   ├── settings/
│   │   └── actions.ts              # updateProfile, updateGoals, updateNotifications
│   ├── login/
│   ├── signup/
│   ├── forgot-password/
│   ├── reset-password/
│   ├── help/
│   └── terms/
│
├── components/
│   ├── kokonutui/                  # App-specific components
│   │   ├── layout.tsx              # App shell wrapper
│   │   ├── sidebar.tsx             # Left nav + Demo Mode toggle
│   │   ├── top-nav.tsx             # Header bar (breadcrumb, bell, avatar)
│   │   ├── dashboard.tsx           # Dashboard server component (checks demo cookie)
│   │   ├── content.tsx             # Dashboard client: metrics, charts, empty state
│   │   ├── upload-content.tsx      # Upload page: file dropzone + manual entry table
│   │   ├── analytics-content.tsx   # Analytics client: charts, empty state
│   │   ├── activity-content.tsx    # Activity log client
│   │   ├── ai-insights-content.tsx # AI insights client: real ai_analysis data
│   │   ├── reports-content.tsx     # Reports client: stacked cards + impact colors + download
│   │   ├── settings-content.tsx    # Settings client: account, goals, password change
│   │   └── profile-01.tsx          # Profile dropdown panel
│   ├── notifications-modal.tsx     # Bell notifications dialog
│   ├── theme-provider.tsx          # next-themes wrapper
│   ├── theme-toggle.tsx            # Sun/Moon toggle (implemented but not rendered)
│   └── ui/                         # Full shadcn/ui component library (40+ components)
│
├── hooks/
│   ├── use-mobile.ts               # useIsMobile() – 768px breakpoint
│   └── use-toast.ts                # Reducer-based toast state manager
│
├── lib/
│   ├── utils.ts                    # cn() = clsx + tailwind-merge
│   ├── demo-data.ts                # Static demo data constants (all pages)
│   └── supabase/
│       ├── client.ts               # createBrowserClient — cookieOptions.maxAge = 1yr
│       ├── server.ts               # createServerClient — cookies maxAge fallback = 1yr
│       └── types.ts                # TypeScript types for all 10 DB tables
│
├── public/
│   └── logo.svg                    # App logo SVG (sidebar, login, signup)
│
├── chrome-extension/               # Chrome MV3 extension (separate from Next.js app)
│   ├── manifest.json               # v1.1.0, permissions: tabs, storage, activeTab, idle
│   ├── background.js               # Service worker: tab tracking, CO₂/kWh estimation
│   ├── content.js                  # Video detection + carbon warning banner injection
│   ├── popup.html/css/js           # Dark UI: 2×2 metric grid (kWh · data · time · ₹), site cost
│   ├── analytics.html/css/js       # 7-day analytics: CO₂ + ₹ energy cost per site + 4 metric cards
│   └── icons/                      # PNG icons (16, 48, 128) + create-icons.js generator
│
├── middleware.ts                   # Auth guard: unauthenticated → /login; session refresh
├── supabase/
│   └── schema.sql                  # Full DB schema + RLS policies + signup trigger
├── CLAUDE.md                       # This file
├── components.json                 # shadcn/ui config
├── tailwind.config.js
├── next.config.mjs
├── package.json
├── tsconfig.json
└── pnpm-lock.yaml
```

---

## Pages — What Each One Shows

### `/dashboard`
Main overview, server component checks demo cookie.
- **Real data path**: reads `usage_entries` + `ai_analysis`; shows CO₂ charts from real entries; empty state with link to `/upload` when no data
- **Demo mode**: uses static demo data from `lib/demo-data.ts`
- **Tabs**: Today (per-entry bar chart colored by device) | 7D (smooth area chart, avg ReferenceLine) | All (area chart of all sessions)
- **Hours by Device**: donut PieChart with device breakdown
- `CO2_BASE` in `dashboard.tsx`: `{ phone: 0.4, laptop: 10, tablet: 3, desktop: 20, smart_tv: 35, console: 50, smartwatch: 0.05 }` (gCO₂/hr)

### `/upload`
Data entry hub. Client component `upload-content.tsx`.
- **File dropzone**: accepts JPG/PNG/WEBP → reads as base64 → POST `/api/analyze` (image mode) → AI extracts entries → user confirms → saved to `usage_entries`
- **Manual entry table**: dynamic rows with Date | Device | Time (hr/min toggle) | Activity. Add/remove rows.
  - Device types: `phone`, `laptop`, `tablet`, `desktop`, `smart_tv`, `console`, `smartwatch`
  - Time column: number input + `hr`/`min` pill toggle — minutes auto-converted to hours on save
  - Activity types: `streaming`, `browsing`, `social`, `gaming`, `calls`, `productivity`, `mixed`
- **"Analyze with AI"**: saves entries to `usage_entries` + POST `/api/analyze` (analyze mode) → AI calculates CO₂ → saves to `ai_analysis` → redirects to `/ai-insights`
- **"Save without AI"**: saves entries to `usage_entries` only
- Files never leave the browser — only extracted/entered data hits the DB

### `/analytics`
Deep consumption analysis, server component checks demo cookie.
- **Real data path**: reads `monthly_readings`, `category_breakdown`, `hourly_readings`
- **Empty state** when no data, links to `/upload`
- Area chart (monthly trend), Pie chart (by category), Bar chart (time-of-use blocks), comparison table

### `/ai-insights`
Real AI analysis results, server component reads `ai_analysis` table.
- **Empty state** with link to `/upload` when no analyses
- **Summary hero**: total CO₂ across all analyses, latest summary text
- **Recommendations grid**: top recommendations from latest analysis
- **Analysis history**: list of all past analyses with date, entry count, CO₂

### `/activity`
System event log, server component reads `activity_events` table.
- Empty state when no events
- Icons color-coded by type: alert=red, success=green, warning=yellow, info=blue
- Relative timestamps via `date-fns`

### `/reports`
AI analysis reports, server component reads `ai_analysis` + `usage_entries`.
- **Empty state** with link to `/upload`
- **3 stat cards** with icons: Total Reports (blue), Entries Analysed (violet), Total CO₂ (emerald)
- **Segmented filter tabs**: All | This Month | Last Month
- **Stacked report cards** (one below one, full width):
  - Left border color-coded by CO₂ impact: emerald=low (<100g), amber=moderate (100–500g), red=high (>500g)
  - Header: report number badge, title, impact badge, date + relative time, CO₂ (colored), entries, Export button
  - Body split: **Summary** (left) | **Recommendations** (right, numbered circles, all shown)
- **Export button**: generates `.txt` report client-side (no storage)

### `/settings`
Account and preferences, server component reads `profiles` + `user_preferences`.
- Avatar strip with name initial + gradient background
- Account info (name editable, email read-only) with per-section save feedback
- **Password Change**: working — `supabase.auth.updateUser({ password })` client-side, validation (min 6 chars, match)
- Carbon Goals (daily CO₂ target g/day, screen time hrs/week) with unit labels
- Notifications (5 toggles) — saved via `updateNotifications` server action
- Your Data: stat cards + Export/Clear buttons (UI only)
- Danger Zone (Delete Account — no handler)

### `/help`
FAQ and support. Static content, 4 collapsible FAQ sections.

### `/terms`
Terms of Service. Static content, 10 legal sections. Last updated: March 2026.

---

## Design System

### Color Palette

**App chrome (light):** `white` backgrounds, `gray-200` borders, `gray-900` text, `gray-50` hover surfaces

**App chrome (dark):**
- Main background: `#0F0F12`
- Hover states: `#1F1F23`
- Borders: `#1F1F23`
- Secondary borders: `#2B2B30`

**Accent colors:**
- Primary gradient: `from-blue-500 to-cyan-500` (brand color)
- Demo mode: `violet` accent
- Environmental/eco: `green-500` / `emerald` (CO₂, leaf icons)
- Alert: red-500 | Success: green-500 | Warning: yellow-500 | Info: blue-500
- CO₂ impact: emerald=low | amber=moderate | red=high

### Skeleton Loading Pattern
```tsx
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-[#1F1F23] ${className ?? ""}`} />
)
```
Each `loading.tsx` mimics the shape of its page and wraps in `<Layout>`.

### Utility Function
```ts
import { cn } from "@/lib/utils"
cn("base-class", condition && "conditional-class", "another-class")
```

---

## Key Conventions

1. **Most pages are async server components** that fetch from Supabase, then pass props to `"use client"` child components for interactivity/charts.
2. **Demo mode check** in every data-fetching server component: `cookies().get("iw_demo_mode")?.value === "1"` → return static data from `lib/demo-data.ts`.
3. **`memo()` on all layout components** (`Layout`, `Sidebar`, `TopNav`).
4. **`cn()` for all className merging** — never use string concatenation.
5. **shadcn/ui components** live in `components/ui/` — do not modify directly.
6. **App-specific components** live in `components/kokonutui/`.
7. **Files never saved to storage** — uploaded images are read as base64 client-side and sent to the API route for AI extraction; only the extracted data is persisted in Supabase.
8. **Groq API key is server-side only** — never prefix with `NEXT_PUBLIC_`.
9. **"Groq" / "Groq AI" never shown in UI** — always referred to as "Advanced AI analysis" in user-facing text.

---

## Authentication & Database

### Auth
- **Provider**: Supabase email/password only (no OAuth)
- **Package**: `@supabase/ssr` + `@supabase/supabase-js`
- **Session strategy**: Supabase SSR cookies with `maxAge: 60 * 60 * 24 * 365` (1 year) — persists across browser close
- **Route protection**: `middleware.ts` — unauthenticated → `/login`, authenticated on `/login|/signup` → `/dashboard`
- **Public routes**: `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/terms`, `/help`
- **Server actions**: `app/auth/actions.ts` — `signIn`, `signUp`, `signOut`
- **Disable email confirmation** in Supabase Dashboard → Auth → Providers → Email

### Session Persistence
`lib/supabase/client.ts` sets `cookieOptions: { maxAge: 60 * 60 * 24 * 365, sameSite: "lax" }` on `createBrowserClient`.
`middleware.ts` and `lib/supabase/server.ts` both apply `maxAge: options?.maxAge ?? 60 * 60 * 24 * 365` fallback when writing cookies, so sessions survive browser restarts.

### Supabase Client Utilities
| File | Used in | Notes |
|---|---|---|
| `lib/supabase/client.ts` | `"use client"` components | `createBrowserClient` + persistent cookieOptions |
| `lib/supabase/server.ts` | Server components, server actions, API routes | `createServerClient` + `await cookies()` + maxAge fallback |
| `lib/supabase/types.ts` | All files | TypeScript types for all 10 tables |

### Database Schema (10 tables)
| Table | Purpose | Key columns |
|---|---|---|
| `profiles` | User identity | `id` (= auth.users.id), `email`, `full_name` |
| `user_preferences` | Goals + notification flags | `daily_kwh_target`, `monthly_budget_dollars`, `notifications` (JSONB) |
| `devices` | Placeholder device records | `name`, `device_type`, `status`, `last_sync_at` |
| `hourly_readings` | kW per hour (demo/legacy) | `hour_label`, `kw_usage`, `kw_target` |
| `daily_readings` | kWh per day (demo/legacy) | `date`, `kwh_total` |
| `monthly_readings` | kWh per month (demo/legacy) | `month_label`, `sort_order`, `kwh_total` |
| `category_breakdown` | kWh by category (demo/legacy) | `category`, `kwh_total`, `percentage`, `trend_direction` |
| `activity_events` | System event log | `event_name`, `event_type`, `device_name`, `occurred_at` |
| `usage_entries` | **User digital usage records** | `date`, `device_type`, `daily_hours`, `activity_type`, `notes` |
| `ai_analysis` | **AI-generated CO₂ analysis** | `summary`, `co2_estimate_grams`, `recommendations` (JSONB), `entry_count` |

**RLS**: Every table has `FOR ALL` policy: `auth.uid() = user_id`.

**Signup trigger**: `public.handle_new_user()` — seeds only `profiles`, `user_preferences`, and 4 placeholder `devices` rows. No chart data seeded (new users start with empty state).

### Data Fetching Architecture

| Route | Server component | Client component |
|---|---|---|
| `/dashboard` | `components/kokonutui/dashboard.tsx` | `components/kokonutui/content.tsx` |
| `/upload` | `app/upload/page.tsx` | `components/kokonutui/upload-content.tsx` |
| `/analytics` | `app/analytics/page.tsx` | `components/kokonutui/analytics-content.tsx` |
| `/ai-insights` | `app/ai-insights/page.tsx` | `components/kokonutui/ai-insights-content.tsx` |
| `/activity` | `app/activity/page.tsx` | `components/kokonutui/activity-content.tsx` |
| `/reports` | `app/reports/page.tsx` | `components/kokonutui/reports-content.tsx` |
| `/settings` | `app/settings/page.tsx` | `components/kokonutui/settings-content.tsx` |

### Groq AI API Route (`app/api/analyze/route.ts`)

POST endpoint with two modes:

| Mode | Model | Input | Output |
|---|---|---|---|
| `image` | `meta-llama/llama-4-scout-17b-16e-instruct` | `{ imageBase64, mimeType }` | `{ entries: UsageEntryInput[] }` |
| `analyze` | `llama-3.3-70b-versatile` | `{ entries: UsageEntryInput[] }` | Saves `ai_analysis` row, returns it |

CO₂ emission factors (gCO₂/hour):
| Device | gCO₂/hr | Notes |
|---|---|---|
| phone | 0.4 | avg 0.5W + network |
| laptop | 10 | ~25W avg + network |
| tablet | 3 | ~5W avg + network |
| desktop | 20 | ~50W avg + network |
| smart_tv | 35 | ~80W avg |
| console | 50 | ~120W avg (PS/Xbox) |
| smartwatch | 0.05 | negligible |

Activity multipliers: `streaming×3`, `gaming×2`, `social×2`, `calls×1.5`, `mixed×1.2`, `browsing×1`, `productivity×0.7`

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
GROQ_API_KEY=<from console.groq.com>        # server-side only, never NEXT_PUBLIC_
```

---

## Chrome Extension

Separate Chrome MV3 extension at `chrome-extension/`. Released on GitHub at:
**https://github.com/manasdutta04/invisiblewatts/releases** (v1.1.0)

- `manifest.json` — permissions: tabs, storage, activeTab, idle
- `background.js` — service worker: tab tracking, CO₂/kWh/MB estimation per known domain, daily stats in chrome.storage.local
- `content.js` — detects video playback → sends to background; injects carbon warning banner on high-impact sites
- `popup.html/css/js` — 2×2 metric grid (kWh · data · time · ₹ cost), current site stats with cost, AI tip, ring meter
- `analytics.html/css/js` — 2×2 weekly metric cards (CO₂ · data · time · ₹ cost), 7-day SVG bar chart, site rows with ₹ cost
- `content.js` — detects video playback → sends to background; injects carbon warning banner on high-impact sites (dismissed 1/day)
- `popup.html/css/js` — premium dark UI: animated SVG ring meter, metric pills, current site stats, AI tip, dashboard button
- `icons/create-icons.js` — Node.js PNG icon generator (no deps), run `node icons/create-icons.js` to regenerate
- **Install**: Download zip from releases → unzip → Chrome → `chrome://extensions` → Developer mode → Load unpacked
- Landing page "Load in Chrome (developer mode)" button links to the releases page

---

## Roadmap — Known Gaps

### Done
- [x] Supabase auth (email/password) + forgot/reset password flow
- [x] 10-table DB schema with RLS
- [x] All main pages connected to real DB
- [x] File upload + Groq AI extraction (image → entries)
- [x] Groq AI CO₂ analysis (entries → recommendations → saved to DB)
- [x] Demo Mode (cookie-based, sidebar toggle, all pages)
- [x] Reports redesign: stacked layout, impact color system, numbered recs, Export button
- [x] Settings redesign: avatar, per-section save, working password change form
- [x] Empty states on all pages pointing to `/upload`
- [x] SVG logo
- [x] Session persistence across browser close (cookie maxAge = 1 year)
- [x] Upload page: hr/min time toggle + expanded device types (desktop, smart_tv, console, smartwatch)
- [x] Chrome extension v1.0.0 released on GitHub
- [x] Groq branding removed from all UI — shown as "Advanced AI analysis"
- [x] Landing page with Chrome extension download link → GitHub releases
- [x] Energy cost in ₹ — dashboard (5th metric card), reports (per-card stat), AI insights (hero + table column)
- [x] Chrome extension v1.1.0 — energy cost in ₹ in popup (2×2 grid), analytics (4th metric card + per-site cost column)

### Not Yet Built
- [ ] Dashboard/Analytics real data from `usage_entries` (currently shows demo kWh data or empty state — should show digital usage charts)
- [ ] `ThemeToggle` implemented but not rendered in TopNav
- [ ] Sidebar active state not highlighted (`usePathname()` comparison missing in `NavItem`)
- [ ] Notifications are placeholder (no real push/email system)
- [ ] Settings Danger Zone (Delete Account — no handler)
- [ ] `@vercel/analytics` installed but `<Analytics />` not rendered
- [ ] `typescript.ignoreBuildErrors: true` in `next.config.mjs` — fix before production
- [ ] Regional grid emission factor lookup (currently uses global average)
- [ ] Multi-device / org-level tracking

---

## Component Cheatsheet

| Component | Import path | Purpose |
|---|---|---|
| `Layout` | `@/components/kokonutui/layout` | Page shell (sidebar + topnav + main) |
| `Sidebar` | `@/components/kokonutui/sidebar` | Left nav + Demo Mode button |
| `TopNav` | `@/components/kokonutui/top-nav` | Header bar |
| `UploadContent` | `@/components/kokonutui/upload-content` | File dropzone + manual entry form (hr/min toggle, 7 device types) |
| `AiInsightsContent` | `@/components/kokonutui/ai-insights-content` | Real AI analysis display |
| `ReportsContent` | `@/components/kokonutui/reports-content` | Stacked report cards + impact colors + filter + export |
| `Profile01` | `@/components/kokonutui/profile-01` | Avatar dropdown card |
| `NotificationsModal` | `@/components/notifications-modal` | Bell dialog |
| `ThemeToggle` | `@/components/theme-toggle` | Light/dark switch (not rendered) |
| `cn()` | `@/lib/utils` | Tailwind class merging |
| `useIsMobile()` | `@/hooks/use-mobile` | 768px breakpoint boolean |

---

## Development

```bash
pnpm install       # Install dependencies
pnpm dev           # Start dev server (Turbopack) → http://localhost:3000
pnpm build         # Production build
pnpm start         # Start production server
```

---

## Domain Glossary

| Term | Meaning in this project |
|---|---|
| **Digital carbon** | CO₂ emissions from device usage (streaming, browsing, gaming, calls) |
| **CO₂eq** | CO₂ equivalent — normalised greenhouse gas unit |
| **gCO₂/hour** | Grams of CO₂ per hour of device use (emission factor × wattage) |
| **Emission factor** | gCO₂/kWh for a region's electricity grid (global avg: ~400 gCO₂/kWh) |
| **Screen Time** | iOS / macOS feature showing app usage by day |
| **Digital Wellbeing** | Android feature showing app usage data |
| **Usage entry** | One row of `usage_entries`: a device used for N hours on a given day |
| **AI analysis** | One Groq API run over a set of usage entries; produces summary + CO₂ estimate + recommendations |
| **Demo mode** | Cookie-based flag that overlays static hardcoded data on all pages |
| **kWh** | Kilowatt-hour — unit of energy (used in demo data only) |
| **Impact level** | CO₂ severity: low <100g (emerald), moderate 100–500g (amber), high >500g (red) |
