import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";

const ADMIN_NAV = [
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/users", label: "Users" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Second, independent check (middleware already gates /admin/* and
  // 404s non-admins before this ever renders). See lib/auth/require-admin.
  await requireAdmin();

  return (
    <div className="container max-w-5xl py-10">
      <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Admin
          </p>
          <h1 className="text-xl font-semibold tracking-tight">Store management</h1>
        </div>
        <nav className="flex gap-1 rounded-md bg-muted p-1 text-sm font-medium">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-sm px-3 py-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
