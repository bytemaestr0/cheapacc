import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion/fade-in";
import { AccountSettingsForm } from "@/components/shop/account-settings-form";
import { SignOutButton } from "@/components/shop/sign-out-button";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in?redirect=/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="container max-w-xl py-12">
      <FadeIn>
        <div className="mb-8 flex items-center gap-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          {profile?.role === "admin" && <Badge>Admin</Badge>}
        </div>

        <div className="space-y-6">
          {profile?.role === "admin" && (
            <Link
              href="/admin/listings"
              className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-4 transition-colors hover:bg-primary/10"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Admin portal</p>
                  <p className="text-sm text-muted-foreground">
                    Manage listings, orders, and user accounts
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your username or change your password.</CardDescription>
            </CardHeader>
            <CardContent>
              <AccountSettingsForm initialUsername={profile?.username ?? ""} />
            </CardContent>
          </Card>

          <Link
            href="/account/orders"
            className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
          >
            <div>
              <p className="font-medium">Order history</p>
              <p className="text-sm text-muted-foreground">View past orders and deliveries</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Sign out</CardTitle>
              <CardDescription>End your session on this device.</CardDescription>
            </CardHeader>
            <CardContent>
              <SignOutButton />
            </CardContent>
          </Card>
        </div>
      </FadeIn>
    </div>
  );
}
