import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/shop/listing-card";
import { CategoriesSection } from "@/components/shop/categories-section";
import { Hero } from "@/components/shop/hero";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerGrid, StaggerItem } from "@/components/motion/stagger-grid";
import { createClient } from "@/lib/supabase/server";

// Public, non-personalized content — safe to cache and reuse across
// visitors instead of round-tripping to Supabase on every request.
// Revalidates in the background at most once a minute; visitors get a
// cached response instantly while a fresh copy is fetched behind the
// scenes (stale-while-revalidate), so new/edited listings show up
// within a minute without every request waiting on the database.
export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("listings")
    .select("*, categories(name, image_url)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <>
      <Hero />
      <CategoriesSection />

      <section className="mx-auto max-w-[1280px] px-5 py-14 sm:px-6">
        <FadeIn className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Latest listings</h2>
            <p className="mt-1 text-sm text-muted-foreground">Freshly added, ready to review.</p>
          </div>
          <Button variant="outline" size="sm" asChild className="group shrink-0">
            <Link href="/listings">
              View all <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </FadeIn>

        <StaggerGrid className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(listings ?? []).map((listing) => (
            <StaggerItem key={listing.id}>
              <ListingCard listing={listing} />
            </StaggerItem>
          ))}
          {(!listings || listings.length === 0) && (
            <p className="col-span-full text-sm text-muted-foreground">
              No listings yet — add some from{" "}
              <Link href="/admin/listings" className="underline underline-offset-4">
                the admin panel
              </Link>
              .
            </p>
          )}
        </StaggerGrid>
      </section>
    </>
  );
}
