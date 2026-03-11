# InvisibleWatts — LLM Context File

> This file exists so that Claude, Cursor, Copilot, or any other LLM assistant can immediately understand the full context of this project without exploring the codebase from scratch.

---

## What Is InvisibleWatts?

**InvisibleWatts is a platform that quantifies the environmental impact of digital behavior and provides insights to reduce carbon emissions from online activities.**

Core value proposition:
- Users upload screenshots of phone/laptop screen time reports (iOS Screen Time, Android Digital Wellbeing, Windows) OR manually enter their device usage data
- Groq AI extracts data from screenshots and calculates CO₂ emissions from digital activity
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
1. User uploads a screen time screenshot OR manually enters device usage (device type, daily hours, activity, date)
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
| AI | Groq API (llama-3.2-11b-vision + llama-3.3-70b-versatile) | free tier |

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
| `/` | `app/page.tsx` | Server | Redirects to `/dashboard` |
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
│   ├── page.tsx                    # Redirect -> /dashboard
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
│   │   ├── reports-content.tsx     # Reports client: ai_analysis cards + download
│   │   ├── settings-content.tsx    # Settings client: account, goals, notifications
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
│       ├── client.ts               # createBrowserClient (use client components)
│       ├── server.ts               # createServerClient (server components/actions)
│       └── types.ts                # TypeScript types for all 10 DB tables
│
├── public/
│   └── logo.svg                    # App logo SVG (sidebar, login, signup)
│
├── middleware.ts                   # Auth guard: unauthenticated → /login
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
- **Real data path**: reads `hourly_readings` + `daily_readings` + `monthly_readings`; shows empty state with link to `/upload` when no data
- **Demo mode**: uses `DEMO_HOURLY_DATA`, `DEMO_WEEKLY_DATA`, `DEMO_METRICS` from `lib/demo-data.ts`
- **4 MetricCards**: Current Usage (kW), Today's Total (kWh), Monthly Average (kWh), Peak Hours
- **LineChart**: Hourly consumption vs. target
- **BarChart**: Weekly kWh usage (Mon–Sun)
- **3 InsightCards**: static tips (Peak Hours, Savings, Weather)

### `/upload`
Data entry hub. Client component `upload-content.tsx`.
- **File dropzone**: accepts JPG/PNG/WEBP → reads as base64 → POST `/api/analyze` (image mode) → Groq vision extracts entries → user confirms → saved to `usage_entries`
- **Manual entry table**: dynamic rows with Date | Device (phone/laptop/tablet) | Hours | Activity (streaming/browsing/gaming/calls/mixed). Add/remove rows.
- **"Analyze with AI"**: saves entries to `usage_entries` + POST `/api/analyze` (analyze mode) → Groq calculates CO₂ → saves to `ai_analysis` → redirects to `/ai-insights`
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
- **3 stat cards**: Total Reports, Entries Analysed, Total CO₂ tracked
- **Working filter tabs**: All / This Month / Last Month (client-side)
- **Report cards**: each AI analysis → date, CO₂ estimate, entry count, summary, top 3 recommendations
- **Download button**: generates `.txt` report client-side (no storage)

### `/settings`
Account and preferences, server component reads `profiles` + `user_preferences`.
- Account info (name editable, email read-only)
- Usage Goals (daily kWh target, monthly budget) — saved via `updateGoals` server action
- Notifications (5 toggles) — saved via `updateNotifications` server action
- Security (Change Password, 2FA — buttons present, no handlers)
- Danger Zone (Delete Account — no handler)

### `/help`
FAQ and support. Static content, 4 collapsible FAQ sections.

### `/terms`
Terms of Service. Static content, 10 legal sections.

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

---

## Authentication & Database

### Auth
- **Provider**: Supabase email/password only (no OAuth)
- **Package**: `@supabase/ssr` + `@supabase/supabase-js`
- **Session strategy**: Supabase SSR cookies, refreshed by `middleware.ts` on every request
- **Route protection**: `middleware.ts` — unauthenticated → `/login`, authenticated on `/login|/signup` → `/dashboard`
- **Public routes**: `/login`, `/signup`, `/terms`, `/help`
- **Server actions**: `app/auth/actions.ts` — `signIn`, `signUp`, `signOut`
- **Disable email confirmation** in Supabase Dashboard → Auth → Providers → Email

### Supabase Client Utilities
| File | Used in | Notes |
|---|---|---|
| `lib/supabase/client.ts` | `"use client"` components | `createBrowserClient` |
| `lib/supabase/server.ts` | Server components, server actions, API routes | `createServerClient` + `await cookies()` |
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
| `image` | `llama-3.2-11b-vision-preview` | `{ imageBase64, mimeType }` | `{ entries: UsageEntryInput[] }` |
| `analyze` | `llama-3.3-70b-versatile` | `{ entries: UsageEntryInput[] }` | Saves `ai_analysis` row, returns it |

CO₂ emission factors used in prompts:
- Phone: 0.4 gCO₂/hour | Laptop: 10 gCO₂/hour | Tablet: 3 gCO₂/hour
- Activity multipliers: streaming×3, gaming×2, calls×1.5, browsing×1, mixed×1.2

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
GROQ_API_KEY=<from console.groq.com>        # server-side only, never NEXT_PUBLIC_
```

---

## Roadmap — Known Gaps

### Done
- [x] Supabase auth (email/password)
- [x] 10-table DB schema with RLS
- [x] All main pages connected to real DB
- [x] File upload + Groq AI extraction (image → entries)
- [x] Groq AI CO₂ analysis (entries → recommendations → saved to DB)
- [x] Demo Mode (cookie-based, sidebar toggle, all pages)
- [x] Reports with download (client-side .txt generation)
- [x] Empty states on all pages pointing to `/upload`
- [x] SVG logo

### Not Yet Built
- [ ] Dashboard/Analytics real data from `usage_entries` (currently shows demo kWh data or empty state — should show digital usage charts)
- [ ] `ThemeToggle` implemented but not rendered in TopNav
- [ ] Sidebar active state not highlighted (`usePathname()` comparison missing in `NavItem`)
- [ ] Notifications are placeholder (no real push/email system)
- [ ] Settings Security section (Change Password, 2FA — no handlers)
- [ ] Settings Danger Zone (Delete Account — no handler)
- [ ] `@vercel/analytics` installed but `<Analytics />` not rendered
- [ ] `typescript.ignoreBuildErrors: true` in `next.config.mjs` — fix before production
- [ ] `images.unoptimized: true` — remove when deploying to Vercel
- [ ] Regional grid emission factor lookup (currently uses global average)
- [ ] Multi-device / org-level tracking

---

## Component Cheatsheet

| Component | Import path | Purpose |
|---|---|---|
| `Layout` | `@/components/kokonutui/layout` | Page shell (sidebar + topnav + main) |
| `Sidebar` | `@/components/kokonutui/sidebar` | Left nav + Demo Mode button |
| `TopNav` | `@/components/kokonutui/top-nav` | Header bar |
| `UploadContent` | `@/components/kokonutui/upload-content` | File dropzone + manual entry form |
| `AiInsightsContent` | `@/components/kokonutui/ai-insights-content` | Real AI analysis display |
| `ReportsContent` | `@/components/kokonutui/reports-content` | Reports grid + filter + download |
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
