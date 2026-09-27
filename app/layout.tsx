import type { Metadata } from "next";
import { Toaster } from "sonner";
import { CartProvider } from "@/components/shop/cart-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteSidebar } from "@/components/layout/site-sidebar";
import { CookieBanner } from "@/components/layout/cookie-banner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "accountstore — digital goods, delivered securely",
    template: "%s — accountstore",
  },
  description:
    "Browse and buy digital goods and access credentials with secure checkout and manual fulfillment review.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <CartProvider>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-8 px-6 pt-8 md:flex-row">
              <SiteSidebar />
              <main className="min-w-0 flex-1">{children}</main>
            </div>
            <SiteFooter />
          </div>
          <CookieBanner />
          <Toaster position="top-center" richColors closeButton />
        </CartProvider>
      </body>
    </html>
  );
}
