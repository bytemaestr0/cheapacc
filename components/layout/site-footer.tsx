import Link from "next/link";
import { ShoppingBag } from "lucide-react";

const links = [
  { href: "/terms", label: "Rules & Guarantee" },
  { href: "/privacy", label: "Privacy" },
  { href: "/faq", label: "FAQ" },
  { href: "/support", label: "Support" },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-white/[.06]">
      <div className="pointer-events-none absolute inset-x-0 -top-px mx-auto h-px max-w-2xl bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 font-display text-lg font-bold">
            <ShoppingBag className="h-5 w-5 text-primary" /> account<span className="text-muted-foreground">store</span>
          </Link>
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} accountstore. All rights reserved.</p>
        </div>
        <nav className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-muted-foreground">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="relative transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all hover:text-foreground hover:after:w-full">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
