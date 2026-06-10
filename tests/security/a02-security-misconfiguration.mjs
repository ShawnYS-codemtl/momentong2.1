#!/usr/bin/env node
// OWASP A02:2025 — Security Misconfiguration — verification probes for momentong2.1
//
// Defensive checks against a RUNNING server: security headers, verbose-error/exception
// leakage, info/debug disclosure, permissive CORS, and server secrets accidentally shipped
// to the client. Safe: only sends malformed/benign requests and reads responses.
//
// Usage:
//   npm run build && npm run start   # most accurate (prod headers + real client bundle)
//   node tests/security/a02-security-misconfiguration.mjs
//   # or, quick dev check (headers from next.config apply in dev too):
//   npm run dev && node tests/security/a02-security-misconfiguration.mjs

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..", "..");

// ---------- ANSI ----------
const c = { reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m", red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m", cyan: "\x1b[36m" };
const paint = (color, s) => `${c[color]}${s}${c.reset}`;

// ---------- env (no deps) ----------
function loadEnv() {
  const env = { ...process.env };
  try {
    const raw = readFileSync(join(PROJECT_ROOT, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      const key = t.slice(0, i).trim();
      let val = t.slice(i + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      if (env[key] === undefined) env[key] = val;
    }
  } catch { /* optional */ }
  return env;
}

// ---------- results ----------
const results = [];
function record(area, name, verdict, detail) {
  results.push({ area, name, verdict, detail });
  const tag = { PASS: paint("green", "PASS"), FAIL: paint("red", "FAIL"), WARN: paint("yellow", "WARN"), INFO: paint("cyan", "INFO") }[verdict];
  console.log(`  [${tag}] ${name}${detail ? paint("dim", "  — " + detail) : ""}`);
}

async function safeFetch(url, opts) {
  try {
    const res = await fetch(url, { redirect: "manual", ...opts });
    return { res, text: null };
  } catch (err) {
    return { res: null, err };
  }
}

// =====================================================================
// SUITE 1 — security headers
// =====================================================================
function checkHeader(headers, name, { required = true, expect, absent = false } = {}) {
  const val = headers.get(name);
  if (absent) {
    if (val == null) record("headers", `${name} absent`, "PASS", "not disclosed");
    else record("headers", `${name} absent`, "FAIL", `disclosed: "${val}" — set poweredByHeader:false / strip it`);
    return;
  }
  if (val == null) {
    record("headers", name, required ? "FAIL" : "WARN", "missing");
    return;
  }
  if (expect && !expect.test(val)) {
    record("headers", name, "WARN", `present but weak: "${val}"`);
    return;
  }
  record("headers", name, "PASS", val.length > 60 ? val.slice(0, 60) + "…" : val);
}

async function runSuite1(base) {
  console.log(paint("bold", "\n── Suite 1: security headers (GET /) ──\n"));
  const { res, err } = await safeFetch(base + "/");
  if (!res) { record("headers", "GET /", "INFO", `request failed: ${err.message} (is the server running?)`); return; }
  const h = res.headers;
  checkHeader(h, "strict-transport-security", { expect: /max-age=\d{5,}/ });
  // CSP: enforced header is best; Report-Only counts as present-but-not-enforced (WARN).
  const cspEnforced = h.get("content-security-policy");
  const cspReport = h.get("content-security-policy-report-only");
  if (cspEnforced) record("headers", "content-security-policy", "PASS", cspEnforced.slice(0, 60) + "…");
  else if (cspReport) record("headers", "content-security-policy", "WARN", "Report-Only — observed but not enforced; switch to enforcing after verifying no violations");
  else record("headers", "content-security-policy", "FAIL", "missing");
  // clickjacking: X-Frame-Options OR CSP frame-ancestors (enforced or report-only)
  const xfo = h.get("x-frame-options");
  const csp = cspEnforced || cspReport || "";
  if (xfo || /frame-ancestors/i.test(csp)) record("headers", "clickjacking protection", "PASS", xfo ? `X-Frame-Options: ${xfo}` : "CSP frame-ancestors");
  else record("headers", "clickjacking protection", "FAIL", "no X-Frame-Options and no CSP frame-ancestors");
  checkHeader(h, "x-content-type-options", { expect: /nosniff/i });
  checkHeader(h, "referrer-policy");
  checkHeader(h, "permissions-policy", { required: false });
  checkHeader(h, "x-powered-by", { absent: true });
}

// =====================================================================
// SUITE 2 — verbose error / exception leakage
// =====================================================================
const LEAK_RE = /(at\s+\/?[\w./-]+:\d+:\d+|\bError:\s|node_modules|\/Users\/|\/home\/|webpack|ENOENT|stack|process\.env|supabase|stripe\.com\/v1|sk_live|sk_test)/i;

async function probeError(base, name, path, opts, allowStatus) {
  const { res, err } = await safeFetch(base + path, opts);
  if (!res) { record("errors", name, "INFO", `request failed: ${err.message}`); return; }
  let body = "";
  try { body = await res.text(); } catch {}
  // Only the first 2KB matters for leakage signals
  const sample = body.slice(0, 2000);
  if (LEAK_RE.test(sample)) {
    record("errors", name, "FAIL", `response leaks internals (status ${res.status}): ${sample.replace(/\s+/g, " ").slice(0, 120)}…`);
  } else {
    record("errors", name, "PASS", `generic error (status ${res.status})`);
  }
}

async function runSuite2(base) {
  console.log(paint("bold", "\n── Suite 2: verbose error / exception leakage ──\n"));
  await probeError(base, "POST /api/checkout (bad JSON)", "/api/checkout", {
    method: "POST", headers: { "content-type": "application/json" }, body: "{not json",
  });
  await probeError(base, "POST /api/checkout (empty body)", "/api/checkout", {
    method: "POST", headers: { "content-type": "application/json" }, body: "{}",
  });
  await probeError(base, "POST /api/contact (missing fields)", "/api/contact", {
    method: "POST", headers: { "content-type": "application/json" }, body: "{}",
  });
  await probeError(base, "POST /api/contact (over-long message)", "/api/contact", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "x", email: "x@y.co", message: "A".repeat(6000) }),
  });
  await probeError(base, "POST /api/webhooks/stripe (bad signature)", "/api/webhooks/stripe", {
    method: "POST", headers: { "content-type": "application/json", "stripe-signature": "t=1,v1=deadbeef" }, body: "{}",
  });
}

// =====================================================================
// SUITE 3 — info / debug exposure
// =====================================================================
async function runSuite3(base) {
  console.log(paint("bold", "\n── Suite 3: info / debug exposure ──\n"));
  // X-Powered-By already covered in Suite 1; CORS here.
  const { res, err } = await safeFetch(base + "/api/admin/stickers", {
    method: "GET", headers: { origin: "https://evil.example" },
  });
  if (!res) { record("cors", "CORS /api/admin/stickers", "INFO", `request failed: ${err.message}`); return; }
  const acao = res.headers.get("access-control-allow-origin");
  if (acao === "*") record("cors", "CORS wildcard", "FAIL", "Access-Control-Allow-Origin: * on an admin route");
  else if (acao === "https://evil.example") record("cors", "CORS reflects origin", "FAIL", `reflects arbitrary origin: ${acao}`);
  else record("cors", "CORS not permissive", "PASS", acao ? `ACAO: ${acao}` : "no ACAO header (same-origin only)");
}

// =====================================================================
// SUITE 4 — server secrets must not reach the client
// =====================================================================
function firstPartyAssets(html, base) {
  const urls = new Set();
  const re = /(?:src|href)=["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(html))) {
    const u = m[1];
    if (u.startsWith("/_next/") || u.endsWith(".js")) {
      urls.add(u.startsWith("http") ? u : base + u);
    }
  }
  return [...urls].filter((u) => u.includes("/_next/") || u.endsWith(".js")).slice(0, 40);
}

async function runSuite4(base, env) {
  console.log(paint("bold", "\n── Suite 4: server secrets not shipped to client ──\n"));
  const secretKeys = ["SUPABASE_SERVICE_ROLE_KEY", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "SMTP_PASS", "RESEND_API_KEY"];
  const secrets = secretKeys
    .map((k) => ({ k, v: env[k] }))
    .filter((s) => s.v && s.v.length >= 8);
  if (!secrets.length) { record("secrets", "secret scan", "INFO", "no secrets found in .env.local to scan for"); return; }

  const pages = ["/", "/checkout", "/contact"];
  const seen = new Set();
  let scannedAssets = 0, found = false;

  for (const page of pages) {
    const { res } = await safeFetch(base + page);
    if (!res) continue;
    let html = "";
    try { html = await res.text(); } catch {}
    const blobs = [{ url: page, body: html }];
    for (const assetUrl of firstPartyAssets(html, base)) {
      if (seen.has(assetUrl)) continue;
      seen.add(assetUrl);
      const a = await safeFetch(assetUrl);
      if (a.res) { try { blobs.push({ url: assetUrl, body: await a.res.text() }); scannedAssets++; } catch {} }
    }
    for (const { url, body } of blobs) {
      for (const s of secrets) {
        if (body.includes(s.v)) {
          record("secrets", `LEAK in ${url}`, "FAIL", `CONFIRMED: ${s.k} value present in client-served content`);
          found = true;
        }
      }
    }
  }
  if (!found) record("secrets", "secret scan", "PASS", `scanned ${pages.length} pages + ${scannedAssets} JS assets — no server secret found`);
}

// ---------- main ----------
(async () => {
  const env = loadEnv();
  const base = (env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

  console.log(paint("bold", "OWASP A02:2025 — Security Misconfiguration verification"));
  console.log(paint("dim", `Target: ${base}  (server must be running)\n`));

  await runSuite1(base);
  await runSuite2(base);
  await runSuite3(base);
  await runSuite4(base, env);

  const fails = results.filter((r) => r.verdict === "FAIL");
  const warns = results.filter((r) => r.verdict === "WARN");
  const pass = results.filter((r) => r.verdict === "PASS").length;

  console.log(paint("bold", "\n── Summary ──"));
  console.log(`  ${paint("green", pass + " PASS")}   ${paint("yellow", warns.length + " WARN")}   ${paint("red", fails.length + " FAIL")}`);

  if (fails.length) {
    console.log(paint("red", "\nMISCONFIGURATIONS / LEAKS:"));
    for (const f of fails) console.log(paint("red", `  • [${f.area}] ${f.name} — ${f.detail}`));
  }
  if (warns.length) {
    console.log(paint("yellow", "\nWEAK / NEEDS REVIEW:"));
    for (const w of warns) console.log(paint("yellow", `  • [${w.area}] ${w.name} — ${w.detail}`));
  }
  if (!fails.length && !warns.length) console.log(paint("green", "\nNo misconfigurations detected. ✅"));

  console.log("");
  process.exit(fails.length ? 1 : 0);
})();
