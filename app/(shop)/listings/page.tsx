import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/shop/listing-card";
import { ListingSearchForm } from "@/components/shop/listing-search-form";
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
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category: activeSlug, q } = await searchParams;
  const query = (q ?? "").trim();
  const supabase = await createClient();

  const [{ data: listings }, { data: categories }] = await Promise.all([
    supabase
      .from("listings")
      .select("*, categories(id, name, slug, image_url)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .returns<ListingRow[]>(),
    supabase.from("categories").select("*").order("sort_order", { ascending: true }),
  ]);

  const all = listings ?? [];
  const allCategories = categories ?? [];

  // Search across title, description, and category name.
  const searched = query
    ? all.filter((l) => {
        const haystack = `${l.title} ${l.description} ${l.categories?.name ?? ""}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
    : all;

  const filtered = activeSlug
    ? searched.filter((l) => l.categories?.slug === activeSlug)
    : searched;

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

  const isFiltering = Boolean(activeSlug || query);

  return (
    <div className="container py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Browse listings</h1>
        <p className="mt-1 text-muted-foreground">
          {all.length} active listing{all.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mb-8">
        <ListingSearchForm initialQuery={query} activeCategory={activeSlug} />
      </div>

      {/* Category filter pills */}
      <div className="mb-12 flex flex-wrap gap-2">
        <Link
          href={query ? `/listings?q=${encodeURIComponent(query)}` : "/listings"}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
            !activeSlug
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background hover:bg-muted"
          )}
        >
          All
        </Link>
        {allCategories.map((cat) => {
          const isActive = activeSlug === cat.slug;
          const href = `/listings?category=${cat.slug}${query ? `&q=${encodeURIComponent(query)}` : ""}`;
          return (
            <Link
              key={cat.slug}
              href={href}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:bg-muted"
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
                : `No listings match "${query}".`}
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
