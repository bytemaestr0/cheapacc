import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import { CartProvider } from "@/components/shop/cart-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CookieBanner } from "@/components/layout/cookie-banner";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "accountstore — digital goods, delivered securely",
    template: "%s — accountstore",
  },
  description:
    "Browse and buy digital goods and access credentials with secure checkout and manual fulfillment review.",
};

export const viewport: Viewport = { themeColor: "#0b0914", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <CartProvider>
          <div className="relative flex min-h-screen flex-col overflow-x-clip">
            <SiteHeader />
            <main className="min-w-0 flex-1">{children}</main>
            <SiteFooter />
          </div>
          <CookieBanner />
          <Toaster position="top-center" richColors closeButton theme="dark" />
        </CartProvider>
      </body>
    </html>
  );
}
