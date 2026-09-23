import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/motion/fade-in";
import { formatPrice, formatDate } from "@/lib/utils";
import { OrderStatusTimeline } from "@/components/shop/order-status-timeline";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // These two queries don't depend on each other — run them in
  // parallel instead of one after another, which was doubling the
  // round-trip latency on this page for no reason.
  const [{ data: order }, { data: assets }] = await Promise.all([
    supabase.from("orders").select("*, order_items(*, listings(title, slug))").eq("id", id).single(),
    supabase.from("fulfillment_assets").select("*").eq("order_id", id),
  ]);

  if (!order) notFound();

  return (
    <div className="container max-w-2xl py-12">
      <FadeIn>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Order confirmed</h1>
            <p className="text-sm text-muted-foreground">Placed {formatDate(order.created_at)}</p>
          </div>
          <Badge
            variant={
              order.status === "fulfilled"
                ? "success"
                : order.status === "cancelled" || order.status === "refunded"
                ? "destructive"
                : "secondary"
            }
          >
            {order.status}
          </Badge>
        </div>

        <OrderStatusTimeline status={order.status} />

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.listings?.title} <span className="text-muted-foreground">×{item.quantity}</span>
                </span>
                <span>{formatPrice(item.unit_price_cents * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-border pt-2 font-semibold">
              <span>Total</span>
              <span>{formatPrice(order.total_cents, order.currency)}</span>
            </div>
          </CardContent>
        </Card>

        {order.status === "fulfilled" && assets && assets.length > 0 && (
          <Card className="mt-6 border-success/40">
            <CardHeader>
              <CardTitle>Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {assets.map((asset) => (
                <div key={asset.id} className="rounded-md bg-muted p-3 text-sm">
                  <p className="mb-1 font-medium">{asset.label}</p>
                  <pre className="whitespace-pre-wrap font-mono text-xs">{asset.content}</pre>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {order.status === "pending" && (
          <p className="mt-6 text-sm text-muted-foreground">
            We&apos;ve received your order and our team will review and fulfill it shortly.
            You&apos;ll see credentials appear here once it&apos;s ready.
          </p>
        )}
      </FadeIn>
    </div>
  );
}
