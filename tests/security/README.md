# Security tests — OWASP Top 10 (2025)

Defensive verification tests for momentong2.1, organized by the **OWASP Top 10:2025**
categories. Each script *probes our own app* to confirm that a class of control actually
holds. They are safe to run against the real backend: writes use sentinel values, target a
non-existent zero-UUID key, or are no-ops, and any write that unexpectedly succeeds is rolled
back automatically.

This file covers **how to run** each test. Findings and verdicts live in
[`REPORT.md`](./REPORT.md).

## A01 — Broken Access Control

`a01-access-control.mjs`

### Why this test exists

This app has **no buyer accounts** — checkout is anonymous and orders are written by the
Stripe webhook using the service-role client. The **only** principal that ever signs in is
the **admin**. All page/app code talks to Supabase with the **publishable (anon) key**, which
ships to the browser and is therefore effectively public. So access control reduces to one
question:

> Does Supabase **Row Level Security** stop an anonymous client (holding the public key)
> from reading or writing our tables?

RLS policies live in the Supabase dashboard, **not in this repo**, so they can't be verified
by reading code — only by acting as the attacker. That's what this script does.

### Run it

```bash
# Suite 1 — anonymous DB / RLS probes (no server needed)
node tests/security/a01-access-control.mjs

# Suite 1 + Suite 2 — also probe live admin endpoints
npm run dev        # in one terminal
node tests/security/a01-access-control.mjs --http
```

Reads `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and
`NEXT_PUBLIC_SITE_URL` from `.env.local`. Exits non-zero if any **FAIL** (confirmed vuln).

### What it checks

**Suite 1 — anonymous DB probes** (acts as anon, per table × operation):

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `orders` (PII) | must be **blocked** | blocked | blocked | blocked |
| `profiles` (admin flags) | blocked | blocked | blocked (no `is_admin` self-escalation) | blocked |
| `stickers` (catalog) | allowed | blocked | blocked | blocked |
| `collections` (catalog) | allowed | blocked | blocked | blocked |

Plus `rpc("decrement_stock")` → must not be callable by anon (else inventory can be zeroed).

The `collections` write probes double as the test for the **unprotected Server Actions** in
`app/admin/collections/actions.ts` (which have no app-layer auth check) — they are thin
wrappers over anon-key `collections` insert/update/delete, so RLS is the exact boundary they
depend on.

**Suite 2 — anonymous HTTP probes** (`--http`, no auth cookie): every `/api/admin/*` route
should return **401/403** and `/admin` pages should **redirect to `/login`**.

### Reading the results

- **PASS** — RLS / grant / auth definitively blocked the anonymous attempt. Good.
- **FAIL** — **CONFIRMED VULNERABILITY**: anon read sensitive data, or a write succeeded
  (auto-rolled-back). Fix immediately.
- **WARN** — not provably blocked: anon has a table-level `UPDATE`/`DELETE` grant (the probe
  used a non-existent key so 0 real rows were touched, but a permissive policy could allow
  writing real rows). Verify the RLS policy in the Supabase dashboard.
- **INFO** — expected/contextual (e.g. public catalog reads), or an unexpected non-RLS error
  worth a glance.

> Caveat: a sensitive-table **SELECT** returning 0 rows reads as PASS, but an *empty table*
> also returns 0 rows. If `orders`/`profiles` are empty, re-confirm after real data exists.

### Static review findings (companion to the live results)

| # | Location | Finding | Severity |
|---|----------|---------|----------|
| 1 | `app/admin/collections/actions.ts` | create/update/delete Server Actions have **no auth check**; sole defense is RLS. | High (if RLS weak) |
| 2 | `app/api/admin/*` | All four admin API routes correctly check `auth.getUser()` + `is_admin`. | Good |
| 3 | `app/admin/layout.tsx:27` | Checks the stale `error` from `getUser()` instead of the profile-query error (cosmetic). | Minor |
| 4 | `lib/supabase/supabaseServer.ts` | Service-role (RLS-bypass) client used only in the Stripe webhook — appropriate. | Good |
| 5 | `orders` | Holds customer PII (email, name, address) — primary asset RLS must protect. | — |
| 6 | — | No RLS policies in the repo; live testing is mandatory. | Must test |
| 7 | `app/api/admin/orders/[id]/update-status/route.ts:27` | Returns 401 for a forbidden (authenticated-non-admin) caller; should be 403. | Minor |

## A02 — Security Misconfiguration

`a02-security-misconfiguration.mjs`

### Why this test exists

Verifies HTTP-level hardening that code review can't fully confirm: security headers, error
verbosity, tech disclosure, CORS, and whether any server secret accidentally ships to the
client. These are runtime properties, so the test probes a running server.

### Run it

```bash
# Most accurate — prod headers + real client bundle:
npm run build && npm run start      # one terminal
node tests/security/a02-security-misconfiguration.mjs

# Quick dev check (next.config headers apply in dev too):
npm run dev
node tests/security/a02-security-misconfiguration.mjs
```

Targets `NEXT_PUBLIC_SITE_URL` (or `http://localhost:3000`) and reads secret values from
`.env.local` for the leak scan. Exits non-zero if any **FAIL**.

### What it checks

- **Suite 1 — security headers:** HSTS, CSP, clickjacking (`X-Frame-Options`/CSP
  `frame-ancestors`), `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`,
  and that `X-Powered-By` is **absent**.
- **Suite 2 — verbose errors:** malformed requests to `/api/checkout`, `/api/contact`,
  `/api/webhooks/stripe` must return generic bodies (no stack traces / file paths / internals).
- **Suite 3 — info/debug:** CORS with a foreign `Origin` must not wildcard or reflect.
- **Suite 4 — secret scan:** `/`, `/checkout`, `/contact` + first-party JS must not contain any
  server-secret value from `.env.local`.

### Reading the results

- **PASS** — control present/correct.
- **FAIL** — missing protection, info disclosure, or a secret leak.
- **WARN** — present-but-weak, lower-priority, or indeterminate (e.g. missing
  `Permissions-Policy`).

> Current baseline (2026-06-10, after the headers fix): **13 PASS / 1 WARN / 0 FAIL**. The lone
> WARN is the intentional Report-Only CSP — see [`REPORT.md`](./REPORT.md) under A02 for the
> remaining "enforce CSP after observation" step.
