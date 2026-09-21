"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/shop/cart-provider";
import type { Database } from "@/types/database";

type Listing = Database["public"]["Tables"]["listings"]["Row"];

export function AddToCartButton({ listing }: { listing: Listing }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <Button
      size="lg"
      className="w-full sm:w-auto"
      disabled={listing.stock_count <= 0}
      onClick={() => {
        addItem({
          listingId: listing.id,
          title: listing.title,
          slug: listing.slug,
          priceCents: listing.price_cents,
          imageUrl: listing.image_url,
        });
        toast.success(`Added "${listing.title}" to cart`);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
    >
      {listing.stock_count <= 0 ? "Out of stock" : added ? "Added ✓" : "Add to cart"}
    </Button>
  );
}
