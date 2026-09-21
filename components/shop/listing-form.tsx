"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { Database } from "@/types/database";

type Listing = Database["public"]["Tables"]["listings"]["Row"];

export function ListingForm({ listing }: { listing?: Listing }) {
  const router = useRouter();
  const [title, setTitle] = useState(listing?.title ?? "");
  const [slug, setSlug] = useState(listing?.slug ?? "");
  const [description, setDescription] = useState(listing?.description ?? "");
  const [priceDollars, setPriceDollars] = useState(
    listing ? (listing.price_cents / 100).toString() : ""
  );
  const [stockCount, setStockCount] = useState(listing?.stock_count?.toString() ?? "0");
  const [status, setStatus] = useState(listing?.status ?? "draft");
  const [imageUrl, setImageUrl] = useState(listing?.image_url ?? "");
  const [deliveryNotes, setDeliveryNotes] = useState(listing?.delivery_notes ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      description,
      price_cents: Math.round(parseFloat(priceDollars || "0") * 100),
      stock_count: parseInt(stockCount || "0", 10),
      status,
      image_url: imageUrl || null,
      delivery_notes: deliveryNotes || null,
    };

    const res = await fetch(
      listing ? `/api/listings/${listing.id}` : "/api/listings",
      {
        method: listing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? "Could not save listing");
      return;
    }

    toast.success(listing ? "Listing updated" : "Listing created");
    router.push("/admin/listings");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug">Slug (URL path — leave blank to auto-generate)</Label>
        <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="my-listing" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="price">Price (USD)</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            required
            value={priceDollars}
            onChange={(e) => setPriceDollars(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="stock">Stock count</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            value={stockCount}
            onChange={(e) => setStockCount(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="deliveryNotes">Delivery notes (shown to buyer)</Label>
        <textarea
          id="deliveryNotes"
          rows={2}
          value={deliveryNotes}
          onChange={(e) => setDeliveryNotes(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="e.g. Delivered within 24h after manual review"
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : listing ? "Save changes" : "Create listing"}
      </Button>
    </form>
  );
}
