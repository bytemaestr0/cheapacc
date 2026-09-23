import { requireAdmin } from "@/lib/auth/require-admin";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { RoleToggleButton } from "@/components/shop/role-toggle-button";

export const metadata = { title: "Admin — Users" };

export default async function AdminUsersPage() {
  const { supabase, user: currentUser } = await requireAdmin();

  // Same ambiguous-FK situation as the orders page, just from the other
  // direction: orders references profiles via both buyer_id and
  // fulfilled_by, so the reverse embed needs the same hint.
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, email, username, role, created_at, orders!buyer_id(id)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load users:", error.message);
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Users</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Everyone with an account. Promote or demote admins here.
      </p>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((profile: any) => (
              <tr key={profile.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{profile.email}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {profile.username ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={profile.role === "admin" ? "default" : "secondary"}>
                    {profile.role}
                  </Badge>
                </td>
                <td className="px-4 py-3">{profile.orders?.length ?? 0}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(profile.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  {profile.id !== currentUser.id && (
                    <RoleToggleButton
                      userId={profile.id}
                      currentRole={profile.role}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {error && (
          <p className="p-6 text-center text-sm text-destructive">
            Couldn&apos;t load users: {error.message}
          </p>
        )}
        {!error && (!profiles || profiles.length === 0) && (
          <p className="p-6 text-center text-sm text-muted-foreground">No users yet.</p>
        )}
      </div>
    </div>
  );
}
