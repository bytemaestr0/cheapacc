import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { paymentProvider } from "@/lib/payments/provider";

const bodySchema = z.object({
  items: z
    .array(
      z.object({
        listingId: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
  buyerNote: z.string().max(1000).optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { items, buyerNote } = parsed.data;

  // Fetch authoritative prices server-side — never trust client-submitted prices.
  const listingIds = items.map((i) => i.listingId);
  const { data: listings, error: listingsError } = await supabase
    .from("listings")
    .select("*")
    .in("id", listingIds)
    .eq("status", "active");

  if (listingsError || !listings || listings.length !== listingIds.length) {
    return NextResponse.json(
      { error: "One or more items are no longer available" },
      { status: 400 }
    );
  }

  const totalCents = items.reduce((sum, item) => {
    const listing = listings.find((l) => l.id === item.listingId)!;
    return sum + listing.price_cents * item.quantity;
  }, 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      buyer_id: user.id,
      total_cents: totalCents,
      currency: "USD",
      buyer_note: buyerNote ?? null,
      status: "pending",
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }

  const orderItemsPayload = items.map((item) => {
    const listing = listings.find((l) => l.id === item.listingId)!;
    return {
      order_id: order.id,
      listing_id: item.listingId,
      quantity: item.quantity,
      unit_price_cents: listing.price_cents,
    };
  });

  const { error: itemsError } = await supabase.from("order_items").insert(orderItemsPayload);
  if (itemsError) {
    return NextResponse.json({ error: "Could not save order items" }, { status: 500 });
  }

  const origin = new URL(request.url).origin;
  const checkout = await paymentProvider.createCheckout({
    orderId: order.id,
    totalCents,
    currency: "USD",
    buyerEmail: user.email!,
    successUrl: `${origin}/orders/${order.id}`,
    cancelUrl: `${origin}/checkout`,
  });

  return NextResponse.json({ order, checkoutUrl: checkout.url });
}
