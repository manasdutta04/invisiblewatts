<div align="center">

<img src="public/logo.svg" width="72" height="72" alt="InvisibleWatts logo" />

# InvisibleWatts

**Google Analytics for Digital Carbon** — quantify the hidden CO₂ cost of your digital life.

[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Groq AI](https://img.shields.io/badge/Groq-Llama_4-f55036?logoColor=white)](https://groq.com)
[![pnpm](https://img.shields.io/badge/pnpm-v9-f69220?logo=pnpm&logoColor=white)](https://pnpm.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e)](LICENSE.md)
[![Extension v1.1.0](https://img.shields.io/badge/Extension-v1.1.0-f97316?logo=googlechrome&logoColor=white)](https://github.com/manasdutta04/invisiblewatts/releases)
[![Open in v0](https://img.shields.io/badge/Open%20in-v0-black?logo=vercel&logoColor=white)](https://v0.app/chat/projects/prj_bvkaxpFYEFdavofL2NsqwguCfEMy)



</div>

---

## What is InvisibleWatts?

Every stream, scroll, and search burns electricity — and that electricity has a carbon cost that nobody talks about. **InvisibleWatts makes it quantifiable.**

Users upload their phone or laptop screen time reports (iOS Screen Time, Android Digital Wellbeing, or Windows activity), or manually enter device usage data. Groq AI extracts the data, calculates CO₂ grams using real emission factors, and generates personalised recommendations to reduce your digital footprint.

> Think of it as a carbon counter that lives in your browser tab and your pocket — passive, accurate, and actionable.

---

## Core Features

| Feature | Description |
|---|---|
| **Screenshot Upload** | Drag in an iOS/Android screen time screenshot — Groq's vision model extracts all usage data automatically |
| **Manual Entry** | Enter device, hours, and activity type row-by-row with an editable table |
| **AI CO₂ Analysis** | Groq `llama-3.3-70b` calculates per-entry carbon grams using device + activity emission multiples |
| **Energy Cost (₹)** | Converts CO₂ → kWh → ₹ using India's avg grid factor (475 gCO₂/kWh) and tariff (₹7/kWh) — shown on dashboard, reports, and AI insights |
| **Dashboard** | Real-time metrics including CO₂, avg per session, top device, and estimated energy cost |
| **Analytics** | Monthly CO₂ trends, category breakdowns, and time-of-use heatmaps |
| **AI Insights** | Stored AI analysis results with ranked reduction tips and per-analysis cost breakdown |
| **Reports** | Filterable report cards with CO₂ + ₹ cost display and client-side `.txt` download |
| **Chrome Extension** | Passive tab-level CO₂ and ₹ energy cost estimation with 40+ site profiles — v1.1.0 |
| **Demo Mode** | Cookie-based toggle that overlays hardcoded data on every page — no sign-up required |

---

## How It Works

### Web App Data Pipeline

```mermaid
flowchart TD
    A([User]) --> B{Input method}

    B --> C["Upload screenshot<br/>iOS · Android · Windows"]
    B --> D["Manual entry<br/>device · hours · activity"]

    C --> E["FileReader API<br/>base64, never leaves browser"]
    E --> F["POST /api/analyze<br/>mode: image"]
    F --> G["Groq Vision<br/>llama-4-scout-17b-16e-instruct"]
    G --> H[Extracted UsageEntries]
    H --> I{"User confirms<br/>or edits"}
    I --> D

    D --> J[("Supabase<br/>usage_entries")]
    J --> K["POST /api/analyze<br/>mode: analyze"]
    K --> L["Groq Text<br/>llama-3.3-70b-versatile"]
    L --> M["CO2 grams + recommendations JSON"]
    M --> N[("Supabase<br/>ai_analysis")]

    J --> P["/dashboard"]
    J --> Q["/analytics"]
    N --> R["/ai-insights"]
    N --> S["/reports"]
```

### CO₂ Emission Factors

```
Base rates (gCO₂/hour):     Activity multipliers:
  Phone      →   0.4 g        Streaming  × 3.0
  Laptop     →  10.0 g        Gaming     × 2.0
  Tablet     →   3.0 g        Social     × 2.0
  Desktop    →  20.0 g        Calls      × 1.5
  Smart TV   →  35.0 g        Mixed      × 1.2
  Console    →  50.0 g        Browsing   × 1.0
  Smartwatch →   0.05 g       Productivity × 0.7

  Final: CO₂ (g) = base_rate × hours × activity_multiplier

Energy cost conversion (India):
  kWh  = CO₂ (g) ÷ 475          (global avg grid factor: 475 gCO₂/kWh)
  ₹    = kWh × 7                 (India avg domestic tariff: ₹7/kWh)
```

### Chrome Extension Architecture

```mermaid
flowchart LR
    T[Browser Tabs] --> BG["background.js<br/>Service Worker"]
    CS[content.js] -->|VIDEO_PLAYING| BG
    BG -->|flush every 30s| ST[("chrome.storage.local<br/>7-day rolling window")]
    CS -->|high-impact site| BN[Carbon Warning Banner]
    ST --> POP["Popup v1.1.0<br/>ring meter · CO₂ · kWh · ₹ cost"]
    ST --> ANA["analytics.html<br/>7-day charts · ₹ per site"]
    POP -->|open tab| DASH["InvisibleWatts<br/>Dashboard"]
```

### Authentication & Route Protection

```mermaid
sequenceDiagram
    participant Browser
    participant Middleware
    participant Supabase

    Browser->>Middleware: GET /dashboard
    Middleware->>Supabase: getUser() via SSR cookie
    alt Not authenticated
        Middleware-->>Browser: 302 → /login
    else Authenticated
        Middleware-->>Browser: 200 — render page
    end

    Browser->>Middleware: POST /auth/signup
    Middleware->>Supabase: signUp(email, password)
    Supabase-->>Middleware: user + session
    Supabase-)Supabase: TRIGGER handle_new_user()<br/>seeds profiles · user_preferences · devices
    Middleware-->>Browser: 302 → /dashboard
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3.4 + shadcn/ui (New York, neutral) |
| Animations | Motion (`motion/react`) |
| Charts | Recharts 2 |
| Icons | Lucide React + Tabler Icons |
| Database + Auth | Supabase (PostgreSQL + Row-Level Security) |
| AI | Groq API — Llama 4 Scout (vision) · Llama 3.3 70B (text) |
| Package manager | pnpm |
| Deployment | Vercel |

---

## Setup & Development

For environment variables, database setup, project structure, and Chrome extension loading — see **[SETUP.md](SETUP.md)**.

---

## Demo Mode

A cookie (`iw_demo_mode=1`) overlays static hardcoded data across every data page, so anyone can explore the full UI without uploading anything. Toggle it from the sidebar's **Demo** button — it turns violet with an "ON" badge when active. Server components check `cookies().get("iw_demo_mode")?.value === "1"` and return data from `lib/demo-data.ts` instead of querying Supabase.

---

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions, coding standards, and the PR process.

## Security

Found a vulnerability? Please **do not** open a public issue. See [SECURITY.md](SECURITY.md) for the responsible disclosure policy.

## License

MIT — see [LICENSE.md](LICENSE.md).

## Creators

<table>
  <tbody>
    <tr>
    <td align="center" valign="top" width="14.28%"><a href="https://github.com/manasdutta04"><img src="https://avatars.githubusercontent.com/u/122201926?v=4?s=100" width="100px;" alt="Manas Dutta"/><br /><sub><b>Manas Dutta</b></sub></a><br /></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/priya369-ps"><img src="https://avatars.githubusercontent.com/u/253213951?v=4?s=100" width="100px;" alt="Priya Kanta"/><br /><sub><b>Priya Kanta</b></sub></a><br /></td>
    </tr>
  </tbody>
</table>
