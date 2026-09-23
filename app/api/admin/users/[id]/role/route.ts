import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  role: z.enum(["admin", "customer"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: targetUserId } = await params;

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

  // Prevent an admin from demoting themselves via this endpoint — that
  // could leave a store with zero admins with no UI path back in. Do
  // it deliberately elsewhere (e.g. directly in the DB) if truly needed.
  if (targetUserId === user.id) {
    return NextResponse.json(
      { error: "You can't change your own role here" },
      { status: 400 }
    );
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", targetUserId);

  if (error) {
    return NextResponse.json({ error: "Could not update role" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
