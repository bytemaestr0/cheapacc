import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { ListingForm } from "@/components/shop/listing-form";

export const metadata = { title: "Edit listing" };

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const [{ data: listing }, { data: categoryOptions }] = await Promise.all([
    supabase.from("listings").select("*, categories(id, name)").eq("id", id).single(),
    supabase.from("categories").select("id, name").order("sort_order", { ascending: true }),
  ]);

  if (!listing) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Edit listing</h1>
      <ListingForm
        listing={listing}
        categoryOptions={categoryOptions ?? []}
        initialCategoryId={listing.categories?.id ?? null}
      />
    </div>
  );
}
