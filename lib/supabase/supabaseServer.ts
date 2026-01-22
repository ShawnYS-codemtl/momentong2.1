import { createClient } from "@supabase/supabase-js"

// Server-only Supabase client for webhooks, cron jobs, etc.
// Uses the SERVICE ROLE key — never expose this to the client
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
