import { notFound } from "next/navigation";

// middleware.ts rewrites any /admin/* request from a non-admin (including
// signed-out visitors) here. We immediately call notFound() so Next
// renders the same not-found.tsx and returns a real 404 status —
// indistinguishable from hitting a route that was never defined.
// This route is never linked anywhere and isn't meant to be visited
// directly; it exists purely as a rewrite target.
export default function NotFoundAdminRewriteTarget(): never {
  notFound();
}
