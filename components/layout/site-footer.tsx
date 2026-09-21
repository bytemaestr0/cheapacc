import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 text-sm text-muted-foreground md:flex-row">
        <p>&copy; {new Date().getFullYear()} accountstore. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/terms" className="hover:text-foreground">Terms</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/support" className="hover:text-foreground">Support</Link>
        </div>
      </div>
    </footer>
  );
}
