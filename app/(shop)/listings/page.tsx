import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/shop/listing-card";
import { StaggerGrid, StaggerItem } from "@/components/motion/stagger-grid";

export const metadata = { title: "Browse listings" };

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("listings").select("*").eq("status", "active");
  if (category) query = query.eq("category_id", category);

  const { data: listings } = await query.order("created_at", { ascending: false });

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Browse listings</h1>
        <p className="mt-1 text-muted-foreground">
          {listings?.length ?? 0} active listing{listings?.length === 1 ? "" : "s"}
        </p>
      </div>

      <StaggerGrid className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(listings ?? []).map((listing) => (
          <StaggerItem key={listing.id}>
            <ListingCard listing={listing} />
          </StaggerItem>
        ))}
        {(!listings || listings.length === 0) && (
          <p className="col-span-full text-sm text-muted-foreground">
            No listings match right now — check back soon.
          </p>
        )}
      </StaggerGrid>
    </div>
  );
}
