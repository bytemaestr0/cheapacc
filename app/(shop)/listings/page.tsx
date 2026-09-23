import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/shop/listing-card";
import { StaggerGrid, StaggerItem } from "@/components/motion/stagger-grid";
import { FadeIn } from "@/components/motion/fade-in";
import { CATEGORIES, getCategoryConfig } from "@/lib/categories";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

export const metadata = { title: "Browse listings" };

// Public catalog data — cache and revalidate in the background rather
// than hitting Supabase on every page view. searchParams-based category
// filtering still works: filtering happens in-memory below against the
// same cached fetch, so switching categories doesn't cost another
// round-trip either.
export const revalidate = 60;

type ListingRow = Database["public"]["Tables"]["listings"]["Row"] & {
  categories: { slug: string } | null;
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: activeSlug } = await searchParams;
  const supabase = await createClient();

  const { data: listings } = await supabase
    .from("listings")
    .select("*, categories(slug)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .returns<ListingRow[]>();

  const all = listings ?? [];

  const filtered = activeSlug ? all.filter((l) => l.categories?.slug === activeSlug) : all;

  // Group into sections in CATEGORIES order, skipping empty ones.
  const sections = CATEGORIES.map((cat) => ({
    category: cat,
    listings: all.filter((l) => (l.categories?.slug ?? "other") === cat.slug),
  })).filter((s) => s.listings.length > 0);

  return (
    <div className="container py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Browse listings</h1>
        <p className="mt-1 text-muted-foreground">
          {all.length} active listing{all.length === 1 ? "" : "s"}
        </p>
      </div>

      {/* Category filter pills */}
      <div className="mb-12 flex flex-wrap gap-2">
        <Link
          href="/listings"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
            !activeSlug
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background hover:bg-muted"
          )}
        >
          All
        </Link>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeSlug === cat.slug;
          return (
            <Link
              key={cat.slug}
              href={`/listings?category=${cat.slug}`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:bg-muted"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", isActive ? "" : cat.colorClass)} />
              {cat.label}
            </Link>
          );
        })}
      </div>

      {/* Filtered single-category view */}
      {activeSlug ? (
        <StaggerGrid className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((listing) => (
            <StaggerItem key={listing.id}>
              <ListingCard listing={listing} />
            </StaggerItem>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground">
              No listings in {getCategoryConfig(activeSlug).label} right now — check back soon.
            </p>
          )}
        </StaggerGrid>
      ) : (
        // Grouped-by-category view
        <div className="space-y-14">
          {sections.map(({ category, listings: catListings }) => {
            const Icon = category.icon;
            return (
              <FadeIn key={category.slug}>
                <div className="mb-6 flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-5 w-5", category.colorClass)} />
                    <h2 className="text-xl font-semibold tracking-tight">{category.label}</h2>
                    <span className="text-sm text-muted-foreground">({catListings.length})</span>
                  </div>
                  <Link
                    href={`/listings?category=${category.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                  >
                    View all
                  </Link>
                </div>
                <StaggerGrid className="grid grid-cols-1 gap-6 pb-2 sm:grid-cols-2 lg:grid-cols-3">
                  {catListings.slice(0, 3).map((listing) => (
                    <StaggerItem key={listing.id}>
                      <ListingCard listing={listing} />
                    </StaggerItem>
                  ))}
                </StaggerGrid>
              </FadeIn>
            );
          })}
          {sections.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No listings match right now — check back soon.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
