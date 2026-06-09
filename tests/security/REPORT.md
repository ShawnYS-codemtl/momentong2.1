# Security Test Report — OWASP Top 10

Living report of security verification for **momentong2.1**. Defensive testing of our own
site: we confirm controls hold rather than build offensive tooling. Tests live in
`tests/security/` and are safe to run against the real backend (sentinel values, zero-UUID
keys, no-op writes, auto-rollback).

**App context** (see also `tests/security/README.md`): Next.js 16 App Router, Supabase
(auth + Postgres + RLS), Stripe, Resend/Nodemailer. **No buyer accounts** — checkout is
anonymous, orders are written by the Stripe webhook via the service-role client, and the only
principal that signs in is the **admin**. App/page code uses the public publishable (anon) key,
so **Row Level Security is the real access-control boundary** (policies live in the Supabase
dashboard, not the repo).

## Status overview

| Category | Status | Tested | Confirmed vulns | Hardening items open |
|----------|--------|--------|-----------------|----------------------|
| A01 Broken Access Control | ✅ Verified | 2026-06-09 | 0 | 2 (anon write grants; RPC execute) |
| A02 Cryptographic Failures | ⬜ Not started | — | — | — |
| A03 Injection | ⬜ Not started | — | — | — |
| A04 Insecure Design | ⬜ Not started | — | — | — |
| A05 Security Misconfiguration | ⬜ Not started | — | — | — |
| A06 Vulnerable & Outdated Components | ⬜ Not started | — | — | — |
| A07 Identification & Authentication Failures | ⬜ Not started | — | — | — |
| A08 Software & Data Integrity Failures | ⬜ Not started | — | — | — |
| A09 Security Logging & Monitoring Failures | ⬜ Not started | — | — | — |
| A10 Server-Side Request Forgery | ⬜ Not started | — | — | — |

Legend: ✅ Verified · 🟡 In progress · 🔴 Vulnerability found · ⬜ Not started

---

## A01 — Broken Access Control

**Tested:** 2026-06-09 · **Test:** `tests/security/a01-access-control.mjs` ·
**Result:** 14 PASS / 7 WARN / 0 FAIL · **Verdict:** No exploitable vulnerability; 2 defense-in-depth gaps.

### Threat model
Two principals only: the **admin** vs an **anonymous attacker holding the public publishable
key** (it ships to the browser). Core question: does RLS stop the anonymous client from
reading/writing our tables?

### How we tested
- **Suite 1 — anonymous DB probes:** instantiate a Supabase client with the anon key and probe
  every table × operation (SELECT/INSERT/UPDATE/DELETE) plus the `decrement_stock` RPC.
- **Suite 2 — anonymous HTTP probes (`--http`):** hit every `/api/admin/*` route and `/admin`
  page with no auth cookie.

### Results

| Check | Result |
|-------|--------|
| `orders` SELECT/INSERT (anon) | ✅ Blocked — PII not readable, no forged orders |
| `profiles` SELECT/INSERT (anon) | ✅ Blocked — admin flags not readable, no profile injection |
| `stickers`/`collections` SELECT (anon) | ✅ Public read (expected for catalog) |
| `stickers`/`collections` INSERT (anon) | ✅ Blocked by RLS |
| `stickers`/`collections` UPDATE real row (anon) | ✅ Blocked — RLS filtered real rows (no-op write rejected) |
| `/api/admin/*` unauthenticated | ✅ 401 on all four routes |
| `/admin`, `/admin/orders` pages unauthenticated | ✅ 307 redirect to `/login` |

### Static review findings

| # | Location | Finding | Status |
|---|----------|---------|--------|
| 1 | `app/admin/collections/actions.ts` | create/update/delete Server Actions had **no app-layer auth check** (RLS-only). | ✅ **Fixed** 2026-06-09 — added `requireAdmin()` gate. |
| 2 | `app/api/admin/*` | All four admin API routes correctly check `auth.getUser()` + `is_admin`. | ✅ Good |
| 3 | `app/admin/layout.tsx:27` | Checks stale `error` from `getUser()` instead of the profile-query error (cosmetic). | ⬜ Open (minor) |
| 4 | `lib/supabase/supabaseServer.ts` | Service-role (RLS-bypass) client used only in the Stripe webhook — appropriate. | ✅ Good |
| 5 | `orders` | Holds customer PII (email, name, address) — primary asset RLS must protect. | ✅ Protected |
| 6 | — | No RLS policies in repo; required live testing. | ✅ Tested live |
| 7 | `app/api/admin/orders/[id]/update-status/route.ts:27` | Returns 401 for a forbidden (authenticated-non-admin) caller; should be 403. | ⬜ Open (minor) |

### Open hardening items (defense-in-depth — not exploitable today)

1. **Anon holds `UPDATE`/`DELETE` table grants on all tables.** RLS filters the rows so nothing
   leaks, but it makes RLS the sole line of defense. Recommended SQL (Supabase SQL editor):
   ```sql
   revoke insert, update, delete
     on public.orders, public.profiles, public.stickers, public.collections
     from anon;
   revoke select on public.orders, public.profiles from anon;
   ```
   Safe for admin: once logged in, admin requests run as the `authenticated` role, not `anon`.

2. **`decrement_stock` RPC is executable by anon** — an attacker could call it with a large
   `qty` to zero out inventory (the webhook uses the service-role key, so it's unaffected):
   ```sql
   revoke execute on function public.decrement_stock(text, int) from anon, public;
   ```

After applying the SQL, re-run `node tests/security/a01-access-control.mjs`; the 7 WARNs should
flip to PASS.

### Remediation applied in code
- `app/admin/collections/actions.ts` — added `requireAdmin()` helper gating all three Server
  Actions (redirects to `/login` if unauthenticated, `/` if not admin), mirroring
  `app/admin/layout.tsx` and the `/api/admin/*` routes.

---

## How this report is maintained

Update this file whenever a category is tested:
1. Flip its row in the **Status overview** table.
2. Add a `## A0X — <Name>` section using the same shape: Threat model → How we tested →
   Results → Static findings → Open items → Remediation applied.
3. Record the test script name and the PASS/WARN/FAIL summary.
