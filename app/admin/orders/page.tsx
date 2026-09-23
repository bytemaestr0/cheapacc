import { requireAdmin } from "@/lib/auth/require-admin";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPrice } from "@/lib/utils";
import { FulfillDialog } from "@/components/shop/fulfill-dialog";
import { ConfirmOrderButton } from "@/components/shop/confirm-order-button";

export const metadata = { title: "Admin — Orders" };

export default async function AdminOrdersPage() {
  const { supabase } = await requireAdmin();
  // orders has two FKs into profiles (buyer_id and fulfilled_by), so the
  // embed is ambiguous without a hint — !buyer_id tells PostgREST which
  // relationship to use. Without this, Supabase either throws an
  // "ambiguous relationship" error or picks unpredictably, and since we
  // don't currently check `error` below, the effect looks like "orders
  // don't show" (or `profiles` renders empty on every row).
  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      "id, status, total_cents, currency, created_at, profiles!buyer_id(email), order_items(quantity, unit_price_cents, listings(title))"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load orders:", error.message);
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Orders</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Review paid orders and fulfill them manually. Buyers see delivered content the moment
        you mark an order fulfilled.
      </p>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Buyer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Placed</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((order: any) => (
              <tr key={order.id} className="border-t border-border">
                <td className="px-4 py-3 font-mono text-xs">{order.id.slice(0, 8)}</td>
                <td className="px-4 py-3">{order.profiles?.email}</td>
                <td className="px-4 py-3">
                  {order.order_items?.map((i: any) => i.listings?.title).join(", ")}
                </td>
                <td className="px-4 py-3">{formatPrice(order.total_cents, order.currency)}</td>
                <td className="px-4 py-3">
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
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(order.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {order.status === "pending" && (
                      <ConfirmOrderButton orderId={order.id} />
                    )}
                    {order.status === "paid" && <FulfillDialog orderId={order.id} />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {error && (
          <p className="p-6 text-center text-sm text-destructive">
            Couldn&apos;t load orders: {error.message}
          </p>
        )}
        {!error && (!orders || orders.length === 0) && (
          <p className="p-6 text-center text-sm text-muted-foreground">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
