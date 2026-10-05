import type { Database } from "@/types/database";

export type Author = Database["public"]["Tables"]["authors"]["Row"];

/** What the UI renders for a listing's seller. */
export interface DisplayAuthor {
  name: string;
  avatarUrl: string | null;
  anonymous: boolean;
  tags: string[];
  rating: number;
  reviews: number;
  sales: number;
}

/**
 * Listing's author → what to show.
 *  - no author set  → the default author (site owner)
 *  - anonymous      → "Anonymous" with the default user icon
 */
export function resolveAuthor(author?: Author | null, fallback?: Author | null): DisplayAuthor {
  const a = author ?? fallback ?? null;
  if (!a) return { name: "Site Owner", avatarUrl: null, anonymous: false, tags: [], rating: 0, reviews: 0, sales: 0 };
  return {
    name: a.is_anonymous ? "Anonymous" : a.name,
    avatarUrl: a.is_anonymous ? null : a.avatar_url,
    anonymous: a.is_anonymous,
    tags: a.tags ?? [],
    rating: Number(a.rating) || 0,
    reviews: a.review_count,
    sales: a.sales_count,
  };
}
