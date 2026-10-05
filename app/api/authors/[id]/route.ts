import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authorSchema } from "@/lib/author-schema";

async function guard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Sign in required" }, { status: 401 }) };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { supabase };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = await guard();
  if (g.error) return g.error;
  const parsed = authorSchema.partial().safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  if (parsed.data.is_default) await g.supabase!.from("authors").update({ is_default: false }).eq("is_default", true);
  const { data, error } = await g.supabase!.from("authors").update(parsed.data).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ author: data });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = await guard();
  if (g.error) return g.error;
  const { data: a } = await g.supabase!.from("authors").select("is_default").eq("id", id).single();
  if (a?.is_default) return NextResponse.json({ error: "Set another default author before deleting this one." }, { status: 400 });
  const { error } = await g.supabase!.from("authors").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
