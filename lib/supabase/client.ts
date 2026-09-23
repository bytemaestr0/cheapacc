import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Client-side Supabase client — safe to use in "use client" components.
 * Reads the publishable key (sb_publishable_...), which is public by
 * design (RLS policies, not key secrecy, protect the data). This
 * replaces the legacy anon key.
 *
 * `@supabase/ssr` defaults its auth cookie to a ~1 year maxAge, so
 * sessions persist across browser restarts by default regardless of
 * whether the user asked to be remembered. To actually support an
 * opt-in "Remember me", pass `persist: false` when the user did NOT
 * check the box: this makes the cookie a session cookie (cleared when
 * the browser closes) instead of a long-lived one. Call this once per
 * sign-in attempt, before calling supabase.auth.signInWithPassword —
 * the cookie options are fixed at the moment the auth cookies are
 * written during that call.
 */
export function createClient({ persist = true }: { persist?: boolean } = {}) {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: persist
        ? undefined // library default: ~1 year, i.e. "remember me"
        : { maxAge: undefined }, // session cookie: cleared when the browser closes
    }
  );
}
