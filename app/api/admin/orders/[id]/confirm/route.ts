import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Only a pending order can be confirmed — avoids clobbering
  // fulfilled/refunded/cancelled orders back to "paid" via a stale UI.
  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status !== "pending") {
    return NextResponse.json(
      { error: `Order is already ${order.status}, not pending` },
      { status: 409 }
    );
  }

  const admin = createServiceRoleClient();
  const { error } = await admin.from("orders").update({ status: "paid" }).eq("id", orderId);

  if (error) {
    return NextResponse.json({ error: "Could not update order" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
