import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side guard for admin pages/layouts.
 *
 * middleware.ts already rewrites non-admin requests to a 404 before they
 * ever reach these components — this is a second, independent check
 * directly in the render path. Belt-and-suspenders on purpose: a page
 * should never trust that middleware ran (future refactors, alternate
 * entry points, etc.), so every /admin/* page/layout calls this itself
 * and treats "not an admin" identically to "route doesn't exist" by
 * calling notFound() rather than redirecting.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") notFound();

  return { supabase, user };
}
