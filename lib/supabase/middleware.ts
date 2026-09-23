import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

/**
 * Refreshes the Supabase auth session on every request and enforces
 * route protection for /account and /admin. Called from middleware.ts.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. " +
        "Check that .env exists at the project root (copy it from .env.example) " +
        "and restart the dev server — Next.js does not hot-reload env var changes."
    );
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdminRoute = path === "/admin" || path.startsWith("/admin/");
  const isAccountRoute = path === "/account" || path.startsWith("/account/");

  // /admin is treated as if it doesn't exist for anyone who isn't a
  // confirmed admin — including signed-out visitors. We deliberately
  // return a genuine 404 (via rewrite) rather than redirecting to
  // /sign-in or /, which would leak that the route exists at all and
  // invite probing. Route existence itself is not sensitive info we
  // want to hand out to unauthenticated or non-admin requests.
  if (isAdminRoute) {
    let isAdmin = false;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      isAdmin = profile?.role === "admin";
    }

    if (!isAdmin) {
      const notFoundUrl = new URL("/not-found-admin", request.url);
      return NextResponse.rewrite(notFoundUrl, { status: 404 });
    }

    return response;
  }

  if (isAccountRoute && !user) {
    const redirectUrl = new URL("/sign-in", request.url);
    redirectUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
