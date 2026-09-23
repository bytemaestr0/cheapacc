import Link from "next/link";
import { ArrowRight, ShieldCheck, Clock, Headset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerGrid, StaggerItem } from "@/components/motion/stagger-grid";
import { ListingCard } from "@/components/shop/listing-card";
import { createClient } from "@/lib/supabase/server";

// Public, non-personalized content — safe to cache and reuse across
// visitors instead of round-tripping to Supabase on every request.
// Revalidates in the background at most once a minute; visitors get a
// cached response instantly while a fresh copy is fetched behind the
// scenes (stale-while-revalidate), so new/edited listings show up
// within a minute without every request waiting on the database.
export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("listings")
    .select("*, categories(slug)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-[0.4] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="container relative py-24 md:py-32">
          <FadeIn>
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                Buy digital goods, <span className="text-muted-foreground">delivered right.</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Every order is manually reviewed and fulfilled by our team — no bots, no
                surprises. Pay once, get notified the moment it&apos;s ready.
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <Button size="lg" asChild>
                  <Link href="/listings">
                    Browse listings <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/faq">How it works</Link>
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="border-b border-border py-14">
        <div className="container grid grid-cols-1 gap-8 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Reviewed before delivery", copy: "A real person checks every order before anything is handed over." },
            { icon: Clock, title: "Fast manual turnaround", copy: "Most orders are fulfilled within hours, not days." },
            { icon: Headset, title: "Real support", copy: "Questions before or after purchase? We actually answer." },
          ].map((f) => (
            <FadeIn key={f.title}>
              <div className="flex flex-col items-start gap-2">
                <f.icon className="h-6 w-6 text-muted-foreground" />
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.copy}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="container py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Latest listings</h2>
            <p className="text-sm text-muted-foreground">Freshly added, ready to review.</p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/listings">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <StaggerGrid className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(listings ?? []).map((listing) => (
            <StaggerItem key={listing.id}>
              <ListingCard listing={listing} />
            </StaggerItem>
          ))}
          {(!listings || listings.length === 0) && (
            <p className="col-span-full text-sm text-muted-foreground">
              No listings yet — add some from{" "}
              <Link href="/admin/listings" className="underline underline-offset-4">
                the admin panel
              </Link>
              .
            </p>
          )}
        </StaggerGrid>
      </section>
    </>
  );
}
