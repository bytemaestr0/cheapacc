import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Client-side Supabase client — safe to use in "use client" components.
 * Reads the publishable key (sb_publishable_...), which is public by
 * design (RLS policies, not key secrecy, protect the data). This
 * replaces the legacy anon key.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
