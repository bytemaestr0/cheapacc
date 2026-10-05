import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/shop/listing-card";
import { ListingFilters } from "@/components/shop/listing-filters";
import { resolveAuthor, type Author } from "@/lib/authors";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

export const metadata = { title: "Browse listings" };

// Public catalog data — cache and revalidate in the background rather
// than hitting Supabase on every page view. Category/search filtering
// still works: filtering happens in-memory below against the same
// cached fetch, so switching filters doesn't cost another round-trip.
export const revalidate = 60;

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type ListingRow = Database["public"]["Tables"]["listings"]["Row"] & {
  categories: Pick<CategoryRow, "id" | "name" | "slug" | "image_url"> | null;
  authors: Author | null;
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; min?: string; max?: string; sort?: string }>;
}) {
  const { category: activeSlug, q, min, max, sort } = await searchParams;
  const query = (q ?? "").trim();
  const supabase = await createClient();

  const [{ data: listings }, { data: categories }, { data: defaultAuthor }] = await Promise.all([
    supabase
      .from("listings")
      .select("*, categories(id, name, slug, image_url), authors(*)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .returns<ListingRow[]>(),
    supabase.from("categories").select("*").order("sort_order", { ascending: true }),
    supabase.from("authors").select("*").eq("is_default", true).maybeSingle(),
  ]);

  const all = (listings ?? []).map((l) => ({ ...l, author: resolveAuthor(l.authors, defaultAuthor) }));
  const allCategories = categories ?? [];

  // Search across title, description, and category name.
  const searched = query
    ? all.filter((l) => {
        const haystack = `${l.title} ${l.description} ${l.categories?.name ?? ""}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
    : all;

  const minCents = min !== undefined && min !== "" && !isNaN(Number(min)) ? Math.round(Number(min) * 100) : null;
  const maxCents = max !== undefined && max !== "" && !isNaN(Number(max)) ? Math.round(Number(max) * 100) : null;
  const sortKey = ["cheap", "expensive", "newest", "oldest"].includes(sort ?? "") ? sort : "";

  const byCategory = activeSlug
    ? searched.filter((l) => l.categories?.slug === activeSlug)
    : searched;
  const filtered = byCategory
    .filter((l) => (minCents === null || l.price_cents >= minCents) && (maxCents === null || l.price_cents <= maxCents))
    .sort((a, b) => {
      switch (sortKey) {
        case "cheap": return a.price_cents - b.price_cents;
        case "expensive": return b.price_cents - a.price_cents;
        case "oldest": return a.created_at.localeCompare(b.created_at);
        default: return b.created_at.localeCompare(a.created_at);
      }
    });

  // Keep the other active filters when switching category.
  const keep = (slug?: string) => {
    const sp = new URLSearchParams();
    if (slug) sp.set("category", slug);
    if (query) sp.set("q", query);
    if (min) sp.set("min", min);
    if (max) sp.set("max", max);
    if (sortKey) sp.set("sort", sortKey);
    const qs = sp.toString();
    return qs ? `/listings?${qs}` : "/listings";
  };

  const activeCategory = allCategories.find((c) => c.slug === activeSlug);

  // Group into sections in sort_order, skipping empty ones. Listings
  // with no category (deleted category, or never set) fall into "Other".
  const sections = allCategories
    .map((cat) => ({
      category: cat,
      listings: searched.filter((l) => l.categories?.slug === cat.slug),
    }))
    .filter((s) => s.listings.length > 0);

  const uncategorized = searched.filter((l) => !l.categories);

  const isFiltering = Boolean(activeSlug || query || minCents !== null || maxCents !== null || sortKey);

  return (
    <div className="container py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Browse listings</h1>
        <p className="mt-1 text-muted-foreground">
          {all.length} active listing{all.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mb-8">
        <ListingFilters count={isFiltering ? filtered.length : all.length} />
      </div>

      {/* Category filter pills */}
      <div className="mb-12 flex flex-wrap gap-2">
        <Link
          href={keep()}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all active:scale-95",
            !activeSlug
              ? "border-transparent bg-gradient-to-br from-primary to-[hsl(var(--rose))] text-white shadow-[0_8px_24px_-10px_hsl(var(--primary))]"
              : "border-white/10 bg-white/[.04] text-muted-foreground hover:bg-white/[.09] hover:text-foreground"
          )}
        >
          All
        </Link>
        {allCategories.map((cat) => {
          const isActive = activeSlug === cat.slug;
          const href = keep(cat.slug);
          return (
            <Link
              key={cat.slug}
              href={href}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all active:scale-95",
                isActive
                  ? "border-transparent bg-gradient-to-br from-primary to-[hsl(var(--rose))] text-white shadow-[0_8px_24px_-10px_hsl(var(--primary))]"
                  : "border-white/10 bg-white/[.04] text-muted-foreground hover:bg-white/[.09] hover:text-foreground"
              )}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>

      {/* Filtered / searched view */}
      {isFiltering ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground">
              {activeSlug
                ? `No listings in ${activeCategory?.name ?? activeSlug} match${query ? ` "${query}"` : ""}.`
                : `No listings match your filters.`}
            </p>
          )}
        </div>
      ) : (
        // Grouped-by-category view
        <div className="space-y-14">
          {sections.map(({ category, listings: catListings }) => (
            <section key={category.slug}>
              <div className="mb-6 flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold tracking-tight">{category.name}</h2>
                  <span className="text-sm text-muted-foreground">({catListings.length})</span>
                </div>
                <Link
                  href={`/listings?category=${category.slug}`}
                  className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-6 pb-2 sm:grid-cols-2 lg:grid-cols-3">
                {catListings.slice(0, 3).map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </section>
          ))}

          {uncategorized.length > 0 && (
            <section>
              <div className="mb-6 flex items-center gap-2 pb-1">
                <h2 className="text-xl font-semibold tracking-tight">Uncategorized</h2>
                <span className="text-sm text-muted-foreground">({uncategorized.length})</span>
              </div>
              <div className="grid grid-cols-1 gap-6 pb-2 sm:grid-cols-2 lg:grid-cols-3">
                {uncategorized.slice(0, 3).map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </section>
          )}

          {sections.length === 0 && uncategorized.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No listings match right now — check back soon.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
