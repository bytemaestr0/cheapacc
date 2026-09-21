import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingForm } from "@/components/shop/listing-form";

export const metadata = { title: "Edit listing" };

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: listing } = await supabase.from("listings").select("*").eq("id", id).single();

  if (!listing) notFound();

  return (
    <div className="container max-w-2xl py-12">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Edit listing</h1>
      <ListingForm listing={listing} />
    </div>
  );
}
