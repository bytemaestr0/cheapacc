import { ListingForm } from "@/components/shop/listing-form";

export const metadata = { title: "New listing" };

export default function NewListingPage() {
  return (
    <div className="container max-w-2xl py-12">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">New listing</h1>
      <ListingForm />
    </div>
  );
}
