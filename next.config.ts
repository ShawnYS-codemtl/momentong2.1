import type { NextConfig } from "next";

// Content-Security-Policy for this app. Shipped in Report-Only first (see headers() below)
// so we can watch for violations before enforcing. Must allow:
//   - Stripe Elements: js.stripe.com (script + frame), api.stripe.com (connect), hooks.stripe.com (frame)
//   - Supabase: *.supabase.co over https + wss (connect), storage images (img)
// Next.js injects inline bootstrap scripts/styles, hence 'unsafe-inline' (tighten later with nonces).
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "font-src 'self' data:",
  "img-src 'self' data: https://*.supabase.co",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  "frame-src https://js.stripe.com https://hooks.stripe.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
].join("; ");

const securityHeaders = [
  // HSTS — honored only over HTTPS (ignored on localhost). `preload` is a long-term
  // commitment; remove it if you're not ready to submit to the preload list.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Report-Only first — observe violations, then switch the key to "Content-Security-Policy".
  { key: "Content-Security-Policy-Report-Only", value: csp },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
