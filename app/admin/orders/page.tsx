import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPrice } from "@/lib/utils";
import { FulfillDialog } from "@/components/shop/fulfill-dialog";

export const metadata = { title: "Admin — Orders" };

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, profiles(email), order_items(*, listings(title))")
    .order("created_at", { ascending: false });

  return (
    <div className="container max-w-4xl py-12">
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
                  {(order.status === "paid" || order.status === "pending") && (
                    <FulfillDialog orderId={order.id} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!orders || orders.length === 0) && (
          <p className="p-6 text-center text-sm text-muted-foreground">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
