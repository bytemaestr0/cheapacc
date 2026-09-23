import { requireAdmin } from "@/lib/auth/require-admin";
import { ListingForm } from "@/components/shop/listing-form";

export const metadata = { title: "New listing" };

export default async function NewListingPage() {
  const { supabase } = await requireAdmin();
  const { data: categoryOptions } = await supabase.from("categories").select("id, slug");

  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">New listing</h1>
      <ListingForm categoryOptions={categoryOptions ?? []} />
    </div>
  );
}
