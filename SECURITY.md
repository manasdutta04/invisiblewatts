# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| `main` branch | ✅ Active |
| Older tags | ❌ Not supported |

We only maintain the latest code on `main`. If you find a vulnerability in an older version, please verify it still exists on `main` before reporting.

---

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Report security issues privately via one of these channels:

1. **GitHub Security Advisories** — go to the repo → Security → Advisories → "Report a vulnerability"
2. **Email** — if a contact email is listed on the repo profile, use that directly

Include in your report:
- A description of the vulnerability and its potential impact
- Steps to reproduce or a proof-of-concept (if safe to share)
- Any suggested mitigations you're aware of

You can expect an acknowledgement within **72 hours** and a resolution timeline within **14 days** for critical issues.

---

## Security Architecture

### Credential Handling

| Secret | Handling |
|---|---|
| `GROQ_API_KEY` | Server-side only. Accessed exclusively in `app/api/analyze/route.ts`. Never prefixed with `NEXT_PUBLIC_` and never exposed to the client. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public by design — the Supabase anon key is intended for client-side use and is protected by Row-Level Security policies, not secrecy. |
| `NEXT_PUBLIC_SUPABASE_URL` | Public — your Supabase project URL. |
| Session cookies | Managed by `@supabase/ssr`. HTTP-only, signed, refreshed by `middleware.ts` on every request. |

### File Privacy

Uploaded images (screenshots) are **never written to any storage bucket**. The browser reads files using the `FileReader` API and sends only the base64 string to `POST /api/analyze`. The server immediately forwards this to the Groq API and discards it — no blob storage, no CDN, no S3. Only the AI-extracted **text data** is persisted in Supabase.

### Database Access Control

Every table in the Supabase schema uses Row-Level Security with a single `FOR ALL` policy:

```sql
USING (auth.uid() = user_id)
```

This means users can only ever read or write their own rows — enforced at the database level, not just the application layer.

### Authentication

- Email/password only — no OAuth providers
- Sessions use Supabase SSR cookies, validated by `middleware.ts` on every request
- `middleware.ts` redirects unauthenticated users to `/login` for all non-public routes
- Public routes: `/`, `/login`, `/signup`, `/terms`, `/help`

### Chrome Extension

The extension (`chrome-extension/`) operates with local-only data:

- All tracking data is stored in `chrome.storage.local` — it never leaves the device
- The extension makes **no external network requests** (no analytics, no telemetry, no calls to InvisibleWatts servers)
- Permissions requested: `tabs`, `storage`, `activeTab`, `idle` — no `cookies`, no `webRequest`, no broad host permissions beyond `<all_urls>` for the content script

### Content Security Policy

The Chrome Extension enforces MV3's default CSP (`script-src 'self'`), which blocks:
- Inline script execution (`eval`, `Function()`)
- Inline event handlers in HTML (`onerror="..."`, `onclick="..."`)
- Loading scripts from external origins

All extension JS is loaded from local files only.

---

## Known Limitations

- `typescript.ignoreBuildErrors: true` is set in `next.config.mjs` — this should be resolved before a production hardening pass
- The `/api/status` endpoint reveals whether a `GROQ_API_KEY` is configured — this is intentional (internal status indicator) but should be gated behind authentication in a multi-tenant deployment
- Settings → Security section (Change Password, 2FA) has UI but no handlers yet

---

## Dependency Security

We use `pnpm` for package management. To audit dependencies:

```bash
pnpm audit
```

Please report critical dependency vulnerabilities via GitHub Security Advisories as well — we'll update or replace affected packages promptly.
