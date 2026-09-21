import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Server-side Supabase client for use in Server Components, Route Handlers,
 * and Server Actions. Reads/writes the auth cookie via Next's cookies().
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component with no request context.
            // Safe to ignore if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}

/**
 * Secret-key client — bypasses RLS (same privilege level the old
 * service_role key had). NEVER import this in client code or anything
 * that runs in the browser: Supabase's API gateway rejects sb_secret_...
 * keys sent from a browser User-Agent outright, but treat it as
 * server-only regardless. Use only in trusted server contexts (route
 * handlers, webhooks, admin actions) after verifying the caller.
 */
export function createServiceRoleClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // no-op: service role client doesn't manage user sessions
        },
      },
    }
  );
}
