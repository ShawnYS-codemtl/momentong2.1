---
name: security-audit
description: Verify and track momentong2.1's security against the OWASP Top 10. Use when the user names an OWASP category (e.g. "test A01", "check injection"), asks to verify/track a security risk, build security tests, or audit defenses. Defensive verification only — confirm controls hold; never build offensive/exploit tooling.
---

# Security audit — momentong2.1 (OWASP Top 10)

Project-specific version of the OWASP audit loop. Defensive verification of *our own* app:
confirm controls hold, write safe tests, document results. No offensive tooling.

## Project context (start here — it's the threat model)

- **No buyer accounts.** Checkout is anonymous; orders are written by the Stripe webhook using
  the Supabase **service-role** client. The only principal that signs in is the **admin**
  (`app/login/page.tsx`, gated by `profiles.is_admin`).
- App/page code uses the **public publishable (anon) key** (`lib/supabase/server.ts`), so every
  query runs as the `anon` Postgres role under **Row Level Security**. RLS is the real
  access-control boundary, and **RLS policies are not in the repo** (Supabase dashboard) → live
  testing is mandatory.
- Service-role (RLS-bypass) client `lib/supabase/supabaseServer.ts` is used only in the Stripe
  webhook (`app/api/webhooks/stripe/route.ts`).
- Stack: Next.js 16 App Router, Supabase, Stripe, Resend/Nodemailer.

So the access-control threat model is just **anonymous attacker (holding the public key) vs
admin** — no inter-user privilege escalation exists.

## Workflow (per OWASP category)

1. **Map, don't guess.** Read the real code for that category's attack surface first
   (admin gates in `app/admin/layout.tsx`; route handlers in `app/api/**`; Server Actions like
   `app/admin/collections/actions.ts`; RLS-dependent data access in `lib/data/**`; webhook
   signature in `app/api/webhooks/stripe/route.ts`).
2. **Build a safe, runnable test** in `tests/security/` as a standalone Node ESM script
   (`node tests/security/<name>.mjs`; no test runner installed). Safe against the live backend:
   sentinel values, zero-UUID keys, no-op same-value writes, insert-then-rollback, auto-rollback
   with loud flagging. Where relevant, include a DB-layer suite (anon Supabase client) and an
   `--http` suite (endpoints/pages with no auth cookie).
3. **Classify** each check: **PASS** (definitively blocked) / **WARN** (not provably blocked →
   manual review) / **FAIL** (confirmed vuln; auto-rolled-back).
4. **Update the living docs** — `tests/security/REPORT.md` (status table + per-category section:
   Threat model → How we tested → Results → Static findings → Open items → Remediation applied;
   record script name + PASS/WARN/FAIL) and `tests/security/README.md` (how to run).
5. **Remediate when asked**, matching existing patterns (e.g. the `requireAdmin()` gate added to
   `app/admin/collections/actions.ts` mirrors `app/admin/layout.tsx` and `/api/admin/*`).

## Reference: A01 (done — model for future categories)

- Test: `tests/security/a01-access-control.mjs` (Suite 1 = anon DB/RLS probes; `--http` = admin
  endpoints). Result 14 PASS / 7 WARN / 0 FAIL — no exploitable vuln.
- Open hardening (defense-in-depth): `revoke insert,update,delete` from `anon` on all tables;
  `revoke select on orders, profiles from anon`; `revoke execute on decrement_stock from anon, public`.

## OWASP Top 10:2025 map for this stack (where to look next)

This project tracks the **2025** ordering. Done so far: A01 ✅, A02 ✅.

- **A02 Security Misconfiguration** ✅ — `tests/security/a02-security-misconfiguration.mjs`.
  Found: no security headers in `next.config.ts` + `X-Powered-By` disclosed (errors/CORS/secret
  hygiene all clean). Remediation = a `headers()` block + `poweredByHeader:false` (see REPORT.md).
- **A03 Software Supply Chain Failures** — `npm audit`; lockfile integrity; vet dependencies
  (Stripe/Supabase/Resend/nodemailer); build/CI provenance.
- **A04 Cryptographic Failures** — confirm `SUPABASE_SERVICE_ROLE_KEY`/`STRIPE_SECRET_KEY`/
  `SMTP_PASS`/`RESEND_API_KEY` never reach the client bundle; HTTPS/HSTS; cookie security flags.
- **A05 Injection** — Supabase queries are parameterized (good); check XSS in any
  `dangerouslySetInnerHTML`/user-rendered content; validate Server Action / API inputs.
  (`app/api/contact/route.ts` already strips email-header injection + escapes HTML.)
- **A06 Insecure Design** — checkout price/qty integrity (server recomputes from DB in
  `app/api/checkout/route.ts`); rate limiting on contact/checkout.
- **A07 Authentication Failures** — admin login brute-force/session policy (Supabase settings).
- **A08 Software or Data Integrity Failures** — Stripe webhook signature verification (present in
  `app/api/webhooks/stripe/route.ts` — verify it's enforced).
- **A09 Logging & Alerting Failures** — security event logging; ensure logs don't leak PII/secrets.
- **A10 Mishandling of Exceptional Conditions** — error handling that fails safe; no verbose
  errors/stack traces to clients (checked under A02 — generic errors confirmed).
