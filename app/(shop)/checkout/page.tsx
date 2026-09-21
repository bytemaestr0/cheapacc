"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/components/shop/cart-provider";
import { formatPrice } from "@/lib/utils";
import { FadeIn } from "@/components/motion/fade-in";

export default function CheckoutPage() {
  const { items, subtotalCents, clear } = useCart();
  const router = useRouter();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ listingId: i.listingId, quantity: i.quantity })),
          buyerNote: note || undefined,
        }),
      });

      if (res.status === 401) {
        toast.error("Please sign in to check out");
        router.push("/sign-in?redirect=/checkout");
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error ?? "Checkout failed. Please try again.");
        return;
      }

      const { checkoutUrl } = await res.json();
      clear();
      router.push(checkoutUrl);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container py-24 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-xl py-12">
      <FadeIn>
        <h1 className="mb-8 text-2xl font-semibold tracking-tight">Checkout</h1>

        <Card>
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {items.map((item) => (
              <div key={item.listingId} className="flex justify-between text-sm">
                <span>
                  {item.title} <span className="text-muted-foreground">×{item.quantity}</span>
                </span>
                <span>{formatPrice(item.priceCents * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-border pt-2 font-semibold">
              <span>Total</span>
              <span>{formatPrice(subtotalCents)}</span>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 space-y-2">
          <Label htmlFor="note">Note for the fulfillment team (optional)</Label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Anything we should know before fulfilling your order?"
          />
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          No payment provider is connected in this template yet — checkout will create the
          order and take you straight to the order page. Wire up Stripe or Paddle in{" "}
          <code className="rounded bg-muted px-1 py-0.5">lib/payments/provider.ts</code>.
        </p>

        <Button size="lg" className="mt-6 w-full" onClick={handleCheckout} disabled={loading}>
          {loading ? "Placing order..." : `Place order — ${formatPrice(subtotalCents)}`}
        </Button>
      </FadeIn>
    </div>
  );
}
