#!/usr/bin/env node
// OWASP A01: Broken Access Control — verification probes for momentong2.1
//
// Threat model: the only authenticated principal is the admin. Everyone else is
// anonymous and can trivially obtain the public publishable key (it ships to the
// browser). All app/page code queries Supabase with that anon key, so Row Level
// Security is the real access-control boundary. This script BECOMES that anonymous
// attacker and checks whether RLS actually stops it.
//
// Usage:
//   node tests/security/a01-access-control.mjs          # Suite 1: anon DB/RLS probes
//   node tests/security/a01-access-control.mjs --http   # also Suite 2: live admin endpoints (needs `npm run dev`)
//
// Safe by design: writes use sentinel values, target a non-existent zero-UUID key,
// or are no-ops (qty 0); any write that unexpectedly succeeds is rolled back and
// loudly flagged as a CONFIRMED VULNERABILITY.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..", "..");
const ZERO_UUID = "00000000-0000-0000-0000-000000000000"; // valid-uuid-shaped, never a real row

// ---------- tiny ANSI helpers ----------
const c = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
  red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m", cyan: "\x1b[36m",
};
const paint = (color, s) => `${c[color]}${s}${c.reset}`;

// ---------- env loading (no deps) ----------
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
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (env[key] === undefined) env[key] = val;
    }
  } catch {
    // .env.local optional if vars already in process.env
  }
  return env;
}

// ---------- result classification ----------
// RLS denial surfaces either as a "permission denied for table" / RLS-policy error.
function isRlsDenied(error) {
  if (!error) return false;
  const code = error.code || "";
  const msg = (error.message || "").toLowerCase();
  return (
    code === "42501" ||
    code === "PGRST301" ||
    msg.includes("row-level security") ||
    msg.includes("permission denied") ||
    msg.includes("violates row-level security")
  );
}

const results = []; // { area, name, verdict: PASS|FAIL|WARN|INFO, detail }
function record(area, name, verdict, detail) {
  results.push({ area, name, verdict, detail });
  const tag = {
    PASS: paint("green", "PASS"),
    FAIL: paint("red", "FAIL"),
    WARN: paint("yellow", "WARN"),
    INFO: paint("cyan", "INFO"),
  }[verdict];
  console.log(`  [${tag}] ${name}${detail ? paint("dim", "  — " + detail) : ""}`);
}

// =====================================================================
// SUITE 1 — anonymous DB / RLS probes
// =====================================================================
async function probeSelect(supabase, table, { sensitive }) {
  const { data, error, count } = await supabase
    .from(table)
    .select("*", { count: "exact" })
    .limit(1);

  if (error && !isRlsDenied(error)) {
    record("db", `SELECT ${table}`, "INFO", `unexpected error (${error.code}): ${error.message}`);
    return null;
  }
  const rows = count ?? (data ? data.length : 0);
  if (sensitive) {
    if (rows > 0) {
      record("db", `SELECT ${table}`, "FAIL",
        `CONFIRMED VULN: anon read ${rows} row(s) of sensitive data. Sample keys: ${Object.keys(data[0] || {}).join(", ")}`);
    } else {
      record("db", `SELECT ${table}`, "PASS", "anon read blocked (0 rows) — note: also 0 if table is empty");
    }
  } else {
    // public catalog: reading is expected/allowed
    record("db", `SELECT ${table}`, rows > 0 ? "INFO" : "INFO",
      rows > 0 ? `public read OK (${rows}+ rows) — expected for catalog` : "0 rows (empty or blocked)");
  }
  return data && data[0] ? data[0] : null;
}

async function probeInsert(supabase, table, row) {
  const { data, error } = await supabase.from(table).insert(row).select();
  if (isRlsDenied(error)) {
    record("db", `INSERT ${table}`, "PASS", "anon insert blocked by RLS/grant");
    return;
  }
  if (error) {
    // A constraint (FK/not-null/etc.) fired BEFORE RLS rejected it → RLS did not block the attempt.
    record("db", `INSERT ${table}`, "WARN",
      `not RLS-blocked; failed on constraint (${error.code}): ${error.message}. Anon insert may be possible with valid values.`);
    return;
  }
  // Success = vulnerability. Roll back.
  const inserted = data && data[0];
  let rollback = "no row returned to roll back";
  if (inserted) {
    const pk = inserted.id ?? inserted.sid ?? inserted.cid;
    const pkCol = inserted.id !== undefined ? "id" : inserted.sid !== undefined ? "sid" : "cid";
    const del = await supabase.from(table).delete().eq(pkCol, pk);
    rollback = del.error ? `ROLLBACK FAILED (${pkCol}=${pk}) — DELETE MANUALLY` : `rolled back (${pkCol}=${pk})`;
  }
  record("db", `INSERT ${table}`, "FAIL", `CONFIRMED VULN: anon insert succeeded. ${rollback}`);
}

async function probeUpdate(supabase, table, patch, keyCol) {
  // Target a non-existent zero-UUID key so we never touch real data.
  const { error } = await supabase.from(table).update(patch).eq(keyCol, ZERO_UUID).select();
  if (isRlsDenied(error)) {
    record("db", `UPDATE ${table}`, "PASS", "anon update blocked by RLS/grant");
    return;
  }
  if (error) {
    record("db", `UPDATE ${table}`, "INFO", `non-RLS error (${error.code}): ${error.message}`);
    return;
  }
  // No error: table-level UPDATE grant exists for anon. 0 rows because the key doesn't exist,
  // but the grant means a permissive RLS policy could allow writing real rows.
  record("db", `UPDATE ${table}`, "WARN",
    `anon has UPDATE grant (no RLS error; couldn't reach a real row to prove it). Verify the RLS policy does not permit writing real rows — e.g. ${JSON.stringify(patch)}.`);
}

// Definitive (and safe) UPDATE probe for tables anon CAN read: re-write a real row's
// column to its OWN current value (a no-op) and see if the write is accepted.
async function probeUpdateRealRow(supabase, table, realRow, keyCol, col) {
  if (!realRow || realRow[keyCol] === undefined || realRow[col] === undefined) {
    return probeUpdate(supabase, table, { [col]: "SEC-TEST" }, keyCol); // fall back to sentinel
  }
  const { data, error } = await supabase
    .from(table)
    .update({ [col]: realRow[col] }) // same value → no actual data change
    .eq(keyCol, realRow[keyCol])
    .select();
  if (isRlsDenied(error)) {
    record("db", `UPDATE ${table}`, "PASS", "anon update blocked by RLS/grant");
    return;
  }
  if (error) {
    record("db", `UPDATE ${table}`, "INFO", `non-RLS error (${error.code}): ${error.message}`);
    return;
  }
  if (data && data.length > 0) {
    record("db", `UPDATE ${table}`, "FAIL",
      `CONFIRMED VULN: anon updated a real row (${keyCol}=${realRow[keyCol]}, no-op same-value write accepted).`);
  } else {
    record("db", `UPDATE ${table}`, "PASS",
      "anon has the grant but RLS filtered the real row (0 rows written) — not writable.");
  }
}

async function probeDelete(supabase, table, keyCol) {
  const { error } = await supabase.from(table).delete().eq(keyCol, ZERO_UUID);
  if (isRlsDenied(error)) {
    record("db", `DELETE ${table}`, "PASS", "anon delete blocked by RLS/grant");
    return;
  }
  if (error) {
    record("db", `DELETE ${table}`, "INFO", `non-RLS error (${error.code}): ${error.message}`);
    return;
  }
  record("db", `DELETE ${table}`, "WARN",
    "anon has DELETE grant (no RLS error; 0 rows matched sentinel key). Verify the RLS policy does not permit deleting real rows.");
}

async function probeRpc(supabase, realSid) {
  const { error } = await supabase.rpc("decrement_stock", {
    p_sticker_id: realSid ?? ZERO_UUID,
    p_qty: 0, // no-op even if it runs
  });
  if (isRlsDenied(error) || (error && (error.code === "PGRST202" || (error.message || "").includes("Could not find the function")))) {
    record("db", "RPC decrement_stock", "PASS", "not callable by anon");
    return;
  }
  if (error) {
    record("db", "RPC decrement_stock", "INFO", `non-RLS error (${error.code}): ${error.message}`);
    return;
  }
  record("db", "RPC decrement_stock", "WARN",
    "anon CAN call decrement_stock (ran with qty 0, no-op). An attacker could zero out inventory. Restrict EXECUTE to authenticated/service role.");
}

async function runSuite1(env) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.error(paint("red", "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (.env.local)."));
    process.exit(2);
  }

  console.log(paint("bold", "\n── Suite 1: anonymous DB / RLS probes (publishable key) ──\n"));
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  // Sensitive tables — anon must be fully locked out.
  console.log(paint("bold", "orders (customer PII)"));
  await probeSelect(supabase, "orders", { sensitive: true });
  await probeInsert(supabase, "orders", { customer_email: "sec-test@example.invalid", status: "paid" });
  await probeUpdate(supabase, "orders", { status: "paid" }, "id");
  await probeDelete(supabase, "orders", "id");

  console.log(paint("bold", "\nprofiles (admin flags)"));
  await probeSelect(supabase, "profiles", { sensitive: true });
  await probeInsert(supabase, "profiles", { id: ZERO_UUID, is_admin: true });
  await probeUpdate(supabase, "profiles", { is_admin: true }, "id"); // privilege-escalation attempt
  await probeDelete(supabase, "profiles", "id");

  // Catalog tables — anon read OK, but writes must be blocked.
  console.log(paint("bold", "\nstickers (public catalog)"));
  const sticker = await probeSelect(supabase, "stickers", { sensitive: false });
  await probeInsert(supabase, "stickers", { title: "SEC-TEST", price: 1, slug: `sec-test-${Date.now()}` });
  await probeUpdateRealRow(supabase, "stickers", sticker, "sid", "title");
  await probeDelete(supabase, "stickers", "sid");

  console.log(paint("bold", "\ncollections (public catalog — also the unprotected Server Actions' boundary)"));
  const collection = await probeSelect(supabase, "collections", { sensitive: false });
  await probeInsert(supabase, "collections", { location: "SEC-TEST", slug: `sec-test-${Date.now()}` });
  await probeUpdateRealRow(supabase, "collections", collection, "cid", "location");
  await probeDelete(supabase, "collections", "cid");

  console.log(paint("bold", "\nRPC"));
  await probeRpc(supabase, sticker?.sid);
}

// =====================================================================
// SUITE 2 — anonymous HTTP probes of admin endpoints
// =====================================================================
async function probeHttp(name, fn, expect) {
  try {
    const res = await fn();
    const ok = expect(res);
    record("http", name, ok ? "PASS" : "FAIL",
      ok ? `status ${res.status}` : `status ${res.status}${res.headers.get("location") ? ` → ${res.headers.get("location")}` : ""} — expected to be denied/redirected`);
  } catch (err) {
    record("http", name, "INFO", `request failed: ${err.message} (is the dev server running?)`);
  }
}

async function runSuite2(env) {
  const base = (env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  console.log(paint("bold", `\n── Suite 2: anonymous HTTP probes of admin endpoints (${base}) ──\n`));

  const denied = (res) => res.status === 401 || res.status === 403;
  const redirected = (res) =>
    [301, 302, 303, 307, 308].includes(res.status) &&
    (res.headers.get("location") || "").includes("/login");

  await probeHttp("GET /api/admin/stickers", () => fetch(`${base}/api/admin/stickers`), denied);
  await probeHttp("DELETE /api/admin/stickers/:sid",
    () => fetch(`${base}/api/admin/stickers/${ZERO_UUID}`, { method: "DELETE" }), denied);
  await probeHttp("DELETE /api/admin/orders/:id",
    () => fetch(`${base}/api/admin/orders/${ZERO_UUID}`, { method: "DELETE" }), denied);
  await probeHttp("POST /api/admin/orders/:id/update-status",
    () => fetch(`${base}/api/admin/orders/${ZERO_UUID}/update-status`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "status=paid", // valid status so it reaches the auth check, not the 400 validation
    }), denied);
  await probeHttp("GET /admin (page)",
    () => fetch(`${base}/admin`, { redirect: "manual" }), redirected);
  await probeHttp("GET /admin/orders (page)",
    () => fetch(`${base}/admin/orders`, { redirect: "manual" }), redirected);
}

// ---------- main ----------
(async () => {
  const env = loadEnv();
  const wantHttp = process.argv.includes("--http");

  console.log(paint("bold", "OWASP A01 — Broken Access Control verification"));
  console.log(paint("dim", "Acting as an anonymous attacker holding the public publishable key.\n"));

  await runSuite1(env);
  if (wantHttp) await runSuite2(env);

  // ---------- summary ----------
  const fails = results.filter((r) => r.verdict === "FAIL");
  const warns = results.filter((r) => r.verdict === "WARN");
  const pass = results.filter((r) => r.verdict === "PASS").length;

  console.log(paint("bold", "\n── Summary ──"));
  console.log(`  ${paint("green", pass + " PASS")}   ${paint("yellow", warns.length + " WARN")}   ${paint("red", fails.length + " FAIL")}`);

  if (fails.length) {
    console.log(paint("red", "\nCONFIRMED VULNERABILITIES:"));
    for (const f of fails) console.log(paint("red", `  • [${f.area}] ${f.name} — ${f.detail}`));
  }
  if (warns.length) {
    console.log(paint("yellow", "\nNEEDS MANUAL REVIEW (RLS not provably blocking):"));
    for (const w of warns) console.log(paint("yellow", `  • [${w.area}] ${w.name} — ${w.detail}`));
  }
  if (!fails.length && !warns.length) {
    console.log(paint("green", "\nNo confirmed vulnerabilities and nothing flagged for manual review. ✅"));
  }

  console.log("");
  process.exit(fails.length ? 1 : 0);
})();
