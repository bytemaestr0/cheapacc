import Link from "next/link";
import { FileText, ShieldCheck, Sparkles, Flag } from "lucide-react";

const MAIN_LINKS = [
  { href: "/terms", label: "Rules & Guarantee", icon: ShieldCheck },
  { href: "/privacy", label: "Privacy", icon: FileText },
  { href: "/faq", label: "New Features", icon: Sparkles },
  { href: "/support", label: "Report a Bug", icon: Flag },
];

export function SiteSidebar() {
  return (
    <aside className="w-full shrink-0 space-y-6 md:w-60">
      <div>
        <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Main
        </p>
        <nav className="overflow-hidden rounded-md border border-border">
          {MAIN_LINKS.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
