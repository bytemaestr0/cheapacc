import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPrice } from "@/lib/utils";
import { StaggerGrid, StaggerItem } from "@/components/motion/stagger-grid";

export const metadata = { title: "Your orders" };

export default async function AccountOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total_cents, currency, created_at")
    .eq("buyer_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <div className="container max-w-2xl py-12">
      <Link
        href="/account"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Account
      </Link>
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Your orders</h1>

      {(!orders || orders.length === 0) && (
        <p className="text-sm text-muted-foreground">
          No orders yet. <Link href="/listings" className="underline underline-offset-4">Browse listings</Link>.
        </p>
      )}

      <StaggerGrid className="space-y-3">
        {(orders ?? []).map((order) => (
          <StaggerItem key={order.id}>
            <Link
              href={`/orders/${order.id}`}
              className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <div>
                <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium">{formatPrice(order.total_cents, order.currency)}</span>
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
            </Link>
          </StaggerItem>
        ))}
      </StaggerGrid>
    </div>
  );
}
