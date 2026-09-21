import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  label: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params;

  // Verify the caller is an authenticated admin using the *user-scoped*
  // client (respects RLS / real session) before touching anything with
  // elevated privileges.
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

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // From here on, use the service-role client: writing fulfillment
  // secrets and updating order status are actions RLS intentionally
  // restricts from normal user sessions, even admin ones, to keep the
  // write path narrow and auditable through this one route.
  const admin = createServiceRoleClient();

  const { error: assetError } = await admin.from("fulfillment_assets").insert({
    order_id: orderId,
    label: parsed.data.label,
    content: parsed.data.content,
  });
  if (assetError) {
    return NextResponse.json({ error: "Could not save delivery content" }, { status: 500 });
  }

  const { error: orderError } = await admin
    .from("orders")
    .update({
      status: "fulfilled",
      fulfilled_at: new Date().toISOString(),
      fulfilled_by: user.id,
    })
    .eq("id", orderId);

  if (orderError) {
    return NextResponse.json({ error: "Could not update order status" }, { status: 500 });
  }

  // TODO: send buyer a notification email here (e.g. via Resend or
  // Supabase's built-in email, or a queued job) once you have an email
  // provider wired up.

  return NextResponse.json({ success: true });
}
