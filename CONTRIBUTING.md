# Contributing to InvisibleWatts

Thank you for your interest in contributing. This document covers everything you need to get started.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [What We're Looking For](#what-were-looking-for)
- [Development Setup](#development-setup)
- [Project Architecture](#project-architecture)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Environment Variables](#environment-variables)

---

## Code of Conduct

Be respectful, constructive, and inclusive. Focus on the work, not the person. Issues and PRs that are hostile or discriminatory will be closed without comment.

---

## What We're Looking For

Good areas to contribute:

| Area | Examples |
|---|---|
| **Bug fixes** | Incorrect CO₂ calculations, broken UI states, auth edge cases |
| **Roadmap items** | See the [Known Gaps](README.md#roadmap--known-gaps) section in README |
| **Carbon data** | More accurate emission factors, regional grid lookups |
| **Chrome Extension** | New site carbon profiles in `background.js`, popup UX improvements |
| **Accessibility** | ARIA labels, keyboard navigation, contrast ratios |
| **Tests** | Unit tests for emission calculation logic, API route tests |
| **Documentation** | Improving CLAUDE.md, adding JSDoc to complex functions |

Please **open an issue first** before starting work on a large feature — it avoids duplicate effort and lets us align on direction.

---

## Development Setup

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9
- A Supabase project (free tier works)
- A Groq API key (free at [console.groq.com](https://console.groq.com))

### Steps

**1. Install dependencies**
```bash
pnpm install
```

**2. Configure environment variables**

Create `.env.local` in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
GROQ_API_KEY=<from console.groq.com>
```

**3. Apply the database schema**

In your Supabase dashboard → SQL Editor, run the contents of `supabase/schema.sql`. This creates all 10 tables, RLS policies, and the signup trigger.

**4. Disable email confirmation** (for local dev)

Supabase Dashboard → Authentication → Providers → Email → disable "Confirm email".

**5. Start the dev server**
```bash
pnpm dev
```

App is available at `http://localhost:3000`.

---

## Project Architecture

Before making changes, read [`CLAUDE.md`](CLAUDE.md) — it is the single source of truth for architecture decisions, file structure, naming conventions, and design patterns used throughout the codebase.

Key patterns to follow:

- **Server components** fetch from Supabase and pass props to `"use client"` children for charts/interactivity
- **Demo mode** must be respected on every data-fetching page (`cookies().get("iw_demo_mode")?.value === "1"`). The `iw_demo_mode=1` cookie also bypasses auth in `middleware.ts`, so unauthenticated users reaching the app via `/demo` will land directly on the dashboard with demo data — new routes must not break this flow
- **`cn()`** for all className merging — never string concatenation
- **`components/ui/`** — do not modify shadcn/ui primitives; extend them in `components/kokonutui/` instead
- **Files never hit storage** — uploaded images stay in-browser as base64

---

## Making Changes

### Branching

```
main          — production-ready, protected
feature/*     — new features
fix/*         — bug fixes
docs/*        — documentation only
```

### Commit messages

Use the conventional commit format:

```
feat: add regional grid emission factor lookup
fix: correct CO₂ multiplier for gaming activity
docs: update chrome extension setup instructions
refactor: extract co2 calculation into lib/emissions.ts
```

---

## Pull Request Process

1. **Fork** the repo and create your branch from `main`
2. **Test** your changes locally — check both light and dark mode, mobile and desktop
3. **Verify Demo Mode** still works end-to-end if you touched data-fetching pages
4. **Open a PR** with a clear description: what changed, why, and any screenshots for UI changes
5. PRs need at least one approving review before merge

### PR checklist

- [ ] No TypeScript errors (run `pnpm build`)
- [ ] `cn()` used for all className merging
- [ ] New data pages check the `iw_demo_mode` cookie and return early with demo data
- [ ] Unauthenticated demo flow still works end-to-end (`/demo` → `/dashboard` with demo data)
- [ ] No secrets or `.env` files committed
- [ ] Images/files not written to Supabase Storage

---

## Coding Standards

### TypeScript

- Prefer explicit types over `any`
- Use the types defined in `lib/supabase/types.ts` for DB rows
- Server actions return `{ error: string } | null`

### React / Next.js

- Page-level data fetching in **server components** only
- Pass data down as props to client components — no client-side Supabase fetches in page components
- Use `memo()` on layout-level components (`Layout`, `Sidebar`, `TopNav`)
- `loading.tsx` skeleton files mirror the shape of their page

### Styling

- Tailwind only — no inline styles except for dynamic values (chart gradients, etc.)
- Dark mode: use `dark:` variants, never hardcode light-only colours
- App dark background: `#0F0F12`, hover: `#1F1F23`, borders: `#2B2B30`
- Brand gradient: `from-blue-500 to-cyan-500`

### Chrome Extension

- All logic in `background.js` must work as an MV3 Service Worker (no DOM access)
- No external network calls from the extension — only `chrome.storage.local`
- New site profiles go in the `SITE_PROFILES` object in `background.js`

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `GROQ_API_KEY` | Yes | Groq API key — **server-side only**, never `NEXT_PUBLIC_` |

The `/api/status` endpoint will return `{ ok: false }` if `GROQ_API_KEY` is missing, which is reflected as a "Status: Down" badge in the top navbar.
