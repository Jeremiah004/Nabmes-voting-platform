import { createClient } from "@supabase/supabase-js";

// SERVER-ONLY. Never import this file from a "use client" component or
// expose SUPABASE_SERVICE_ROLE_KEY to the browser — it bypasses Row
// Level Security, which is exactly why registration/voting logic has
// to run here rather than directly from the client.
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}
