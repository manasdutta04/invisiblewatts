# InvisibleWatts — LLM Context File

> This file exists so that Claude, Cursor, Copilot, or any other LLM assistant can immediately understand the full context of this project without exploring the codebase from scratch.

---

## What Is InvisibleWatts?

**InvisibleWatts is a platform that quantifies the environmental impact of digital behavior and provides insights to reduce carbon emissions from online activities.**

Core value proposition:
- Track digital energy consumption
- Convert usage to CO₂ emissions
- Provide AI-powered optimization recommendations

The concept is essentially **"Google Analytics for Digital Carbon"** — a dashboard that makes invisible energy usage visible, quantifiable, and actionable.

---

## Product Vision

The platform sits at the intersection of sustainability and software. Target users are:
- Individuals who want to reduce their digital carbon footprint
- Organizations tracking Scope 3 emissions from employee digital activity
- Developers and teams wanting to measure the energy cost of their software

The end goal is a real-time system that:
1. Ingests data from smart meters, IoT sensors, or browser/OS-level APIs
2. Maps energy consumption to CO₂ equivalents using regional grid emission factors
3. Surfaces AI-generated recommendations to reduce consumption
4. Produces exportable compliance/reporting artifacts

**Current state: UI prototype. All data is hardcoded. No backend, no real data ingestion, no auth.**

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
│   Activity              │  p-6, flex-1, overflow-auto│
│   Analytics             │  bg-white dark:bg-[#0F0F12]│
│   Reports               │                            │
│                         │                            │
│  AI & INSIGHTS          │                            │
│   AI Insights           │                            │
│  ─────────────────────  │                            │
│   Settings              │                            │
│   Help & Support        │                            │
└──────────────────────────────────────────────────────┘
```

- `components/kokonutui/layout.tsx` — outer shell (`div.flex.h-screen`)
- `components/kokonutui/sidebar.tsx` — left nav
- `components/kokonutui/top-nav.tsx` — top bar; breadcrumb auto-generated from `usePathname()`
- Mobile: sidebar slides in from the left with a hamburger toggle and overlay backdrop
- Every page imports `<Layout>` directly (except `/dashboard` which uses a server component wrapper)

### Routing

All routes live under `app/` using the Next.js App Router:

| Route | File | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Redirects to `/dashboard` |
| `/dashboard` | `app/dashboard/page.tsx` | Server component → `<Dashboard />` |
| `/analytics` | `app/analytics/page.tsx` | `"use client"` |
| `/ai-insights` | `app/ai-insights/page.tsx` | `"use client"` |
| `/activity` | `app/activity/page.tsx` | `"use client"` |
| `/reports` | `app/reports/page.tsx` | `"use client"` |
| `/settings` | `app/settings/page.tsx` | `"use client"` |
| `/help` | `app/help/page.tsx` | `"use client"` |
| `/terms` | `app/terms/page.tsx` | `"use client"` |

Every route has a co-located `loading.tsx` skeleton file.

---

## File Structure

```
invisiblewatts/
├── app/
│   ├── layout.tsx                  # Root layout: Inter font, ThemeProvider, metadata
│   ├── globals.css                 # Tailwind directives + CSS custom properties
│   ├── page.tsx                    # Redirect -> /dashboard
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── analytics/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── ai-insights/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── activity/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── reports/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── settings/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── help/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   └── terms/
│       ├── page.tsx
│       └── loading.tsx
│
├── components/
│   ├── kokonutui/                  # App-specific components
│   │   ├── layout.tsx              # App shell wrapper
│   │   ├── sidebar.tsx             # Left navigation
│   │   ├── top-nav.tsx             # Header bar
│   │   ├── dashboard.tsx           # Dashboard page shell (server component)
│   │   ├── content.tsx             # Dashboard content: metrics, charts, insights
│   │   ├── profile-01.tsx          # Profile dropdown panel
│   │   ├── list-01.tsx             # (Unused) Fintech accounts list template
│   │   ├── list-02.tsx             # (Unused) Fintech transactions template
│   │   └── list-03.tsx             # (Unused) Fintech goals template
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
│   └── utils.ts                    # cn() = clsx + tailwind-merge
│
├── public/
│   └── logo.jpg                    # App logo (used in sidebar)
│
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
The main overview. Implemented in `components/kokonutui/content.tsx`.
- **4 MetricCards**: Current Usage (2.4 kW), Today's Total (45.2 kWh), Monthly Average (1,245 kWh), Peak Hours (16:00–20:00)
- **LineChart**: Today's hourly consumption vs. target line
- **BarChart**: Weekly kWh usage (Mon–Sun)
- **3 InsightCards**: AI-generated tips (Peak Hours Alert, Savings Opportunity, Weather Impact)

### `/analytics`
Deep consumption analysis.
- 3 stat cards: Average Daily Usage, Monthly Cost, Peak Load
- AreaChart: Monthly trend over 8 months
- PieChart: Consumption by category (HVAC 45%, Water Heating 20%, Lighting 15%, Appliances 20%)
- BarChart: Time-of-use pattern (4 time blocks)
- Comparison table: Category | kWh | % | Cost | Trend

### `/ai-insights`
AI-powered recommendations.
- Summary hero banner showing total potential savings ($3,879/year)
- 6 insight cards with priority levels (HIGH/MEDIUM/LOW/INFO): HVAC Optimization, Time-of-Use Savings, Heating System Upgrade, Water Heater, Battery Storage, Weather Predictions
- AI Analysis Trends: 3-entry timeline

### `/activity`
System event log.
- 8 log entries with type icons (alert=red, success=green, warning=yellow, info=blue)
- Events: Peak Usage, Device Connected, Energy Goal Met, Unusual Pattern, Device Offline, Maintenance, Settings Updated, Report Generated

### `/reports`
Downloadable energy reports.
- Filter tabs: All Reports, Monthly, Quarterly, Annual
- 4 report cards: monthly/quarterly/annual reports with period, kWh, cost, highlights
- Custom report generation CTA

### `/settings`
Account and preferences.
- Account info (name, email, phone, address)
- Energy Goals (daily kWh target, monthly budget)
- Connected Devices (4 devices with online/offline status)
- Notifications (5 checkbox toggles)
- Security (change password, 2FA, sessions)
- Danger Zone (delete account)

### `/help`
FAQ and support.
- 4 collapsible FAQ sections using `<details>`/`<summary>`
- Contact CTA linking to `support@invisiblewatts.com`

### `/terms`
Terms of Service.
- 10 legal sections
- Contact: `legal@invisiblewatts.com`

---

## Design System

### Color Palette

**App chrome (light):** `white` backgrounds, `gray-200` borders, `gray-900` text, `gray-50` hover surfaces

**App chrome (dark):**
- Main background: `#0F0F12` (near-black with blue tint)
- Card/sidebar background: `#0F0F12`
- Hover states: `#1F1F23`
- Borders: `#1F1F23`
- Secondary borders: `#2B2B30`

**Accent colors:**
- Primary gradient: `from-blue-500 to-cyan-500` (brand color)
- Metric icon gradients: blue-cyan, green-emerald, amber-orange, red-pink
- Chart colors: `#0ea5e9` (sky-500), `#f97316` (orange), `#06b6d4` (cyan)
- Alert: red-500 | Success: green-500 | Warning: yellow-500 | Info: blue-500

### Dark Mode
- Strategy: `next-themes` with `attribute="class"` on `<html>`
- Default: `"system"` (respects OS preference)
- All Tailwind dark variants use `dark:` prefix
- `ThemeToggle` component exists in `components/theme-toggle.tsx` but is **not currently rendered** in TopNav

### Typography
- Font: Inter (Google Fonts, loaded via `next/font/google`)
- Heading scale: `text-3xl font-bold` (page titles), `text-lg font-bold` (section headers), `text-sm font-semibold` (labels)

### Animations
- **View Transitions API**: triggered on sidebar nav link clicks (`document.startViewTransition`). Gracefully degrades in unsupported browsers.
- **Page slide-in**: `<main>` has a `slide-in` keyframe (`translateY(8px) → translateY(0)`, 0.4s, ease-out)
- **Skeleton pulse**: `animate-pulse` on all `loading.tsx` files

### Skeleton Loading Pattern
```tsx
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-[#1F1F23] ${className ?? ""}`} />
)
```
Each `loading.tsx` mimics the shape of its page and wraps in `<Layout>` to avoid layout shift.

### Utility Function
```ts
// lib/utils.ts — use this everywhere for conditional Tailwind classes
import { cn } from "@/lib/utils"
cn("base-class", condition && "conditional-class", "another-class")
```

---

## Key Conventions

1. **`"use client"` on all pages** except `app/dashboard/page.tsx` (server component wrapper). Loading skeletons are server components.
2. **`memo()` on all layout components** (`Layout`, `Sidebar`, `TopNav`) to prevent unnecessary re-renders.
3. **All hardcoded data** lives inside the page file as `const` arrays at module scope.
4. **No API routes yet** — `app/api/` directory does not exist.
5. **`cn()` for all className merging** — never use string concatenation.
6. **shadcn/ui components** live in `components/ui/` and should not be modified directly.
7. **App-specific components** live in `components/kokonutui/`.
8. **No auth system** — all pages are publicly accessible.

---

## What Is NOT Yet Built (Roadmap)

These are known gaps between the current UI prototype and the full product vision:

### Backend & Data
- [ ] No database (no Prisma, no Drizzle, no Supabase setup)
- [ ] No API routes — all data is hardcoded static arrays
- [ ] No real smart meter / IoT data ingestion
- [ ] No browser/OS energy tracking APIs integrated
- [ ] No CO₂ conversion logic (energy kWh → emissions factor → gCO₂eq)
- [ ] No regional grid emission factor lookup

### Auth & Users
- [ ] No authentication (no NextAuth, no Clerk, no Auth.js)
- [ ] Profile shows placeholder "Eugene An / Prompt Engineer"
- [ ] No multi-user support

### AI Features
- [ ] AI insights are static placeholder text, not real ML model output
- [ ] No OpenAI / Anthropic / LLM API integration
- [ ] No anomaly detection engine

### UI Gaps
- [ ] `ThemeToggle` is implemented but not rendered in the UI
- [ ] Sidebar nav active state not highlighted (no `usePathname()` comparison in `NavItem`)
- [ ] `@vercel/analytics` dependency installed but `<Analytics />` not rendered
- [ ] `list-01.tsx`, `list-02.tsx`, `list-03.tsx` are unused fintech templates that need to be replaced with energy-domain equivalents
- [ ] Reports download buttons have no handler
- [ ] Settings form inputs have no save handlers
- [ ] Notifications are hardcoded with no real notification system

### Infrastructure
- [ ] `typescript.ignoreBuildErrors: true` in `next.config.mjs` — should be fixed before production
- [ ] `images.unoptimized: true` — should be removed when deploying to Vercel
- [ ] `styles/globals.css` is a duplicate of `app/globals.css` — should be removed
- [ ] `metadata.generator` still says `v0.app` — should be updated

---

## Component Cheatsheet

| Component | Import path | Purpose |
|---|---|---|
| `Layout` | `@/components/kokonutui/layout` | Page shell (sidebar + topnav + main) |
| `Sidebar` | `@/components/kokonutui/sidebar` | Left nav |
| `TopNav` | `@/components/kokonutui/top-nav` | Header bar |
| `Profile01` | `@/components/kokonutui/profile-01` | Avatar dropdown card |
| `NotificationsModal` | `@/components/notifications-modal` | Bell notifications dialog |
| `ThemeToggle` | `@/components/theme-toggle` | Light/dark mode switch |
| `ThemeProvider` | `@/components/theme-provider` | next-themes wrapper (in root layout) |
| `cn()` | `@/lib/utils` | Tailwind class merging |
| `useIsMobile()` | `@/hooks/use-mobile` | 768px breakpoint boolean |
| `useToast()` | `@/hooks/use-toast` | Toast notifications |

---

## Development

```bash
# Install dependencies
pnpm install

# Start dev server (Turbopack — fast HMR)
pnpm dev
# → http://localhost:3000

# Build for production
pnpm build

# Start production server
pnpm start
```

---

## Domain Glossary

| Term | Meaning in this project |
|---|---|
| **kWh** | Kilowatt-hour — unit of energy consumed |
| **kW** | Kilowatt — unit of power (instantaneous consumption rate) |
| **CO₂eq** | CO₂ equivalent — normalised greenhouse gas unit |
| **Emission factor** | gCO₂/kWh for a given region's electricity grid |
| **Peak hours** | Time periods when grid demand is highest (typically 4PM–8PM) |
| **Time-of-use (TOU)** | Variable electricity pricing based on time of day |
| **Smart meter** | IoT device that records real-time energy consumption |
| **HVAC** | Heating, Ventilation, and Air Conditioning — largest residential energy user |
| **Digital carbon** | CO₂ emissions attributable to digital activity (streaming, compute, browsing) |
