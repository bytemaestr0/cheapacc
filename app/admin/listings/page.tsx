import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Admin — Listings" };

export default async function AdminListingsPage() {
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Listings</h1>
          <p className="text-sm text-muted-foreground">Manage what buyers can purchase.</p>
        </div>
        <Button asChild>
          <Link href="/admin/listings/new">New listing</Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(listings ?? []).map((listing) => (
              <tr key={listing.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{listing.title}</td>
                <td className="px-4 py-3">{formatPrice(listing.price_cents, listing.currency)}</td>
                <td className="px-4 py-3">{listing.stock_count}</td>
                <td className="px-4 py-3">
                  <Badge variant={listing.status === "active" ? "success" : "secondary"}>
                    {listing.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/listings/${listing.id}`}>Edit</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!listings || listings.length === 0) && (
          <p className="p-6 text-center text-sm text-muted-foreground">
            No listings yet. Create your first one.
          </p>
        )}
      </div>
    </div>
  );
}
