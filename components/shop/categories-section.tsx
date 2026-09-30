import Link from "next/link";
import Image from "next/image";
import { Tag, LayoutGrid } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerGrid, StaggerItem } from "@/components/motion/stagger-grid";

export async function CategoriesSection() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, image_url")
    .order("sort_order", { ascending: true });

  if (!categories || categories.length === 0) return null;

  const MOBILE_COUNT = 3;
  const remaining = categories.length - MOBILE_COUNT;
  const othersLabel = remaining >= 10 ? "10+ others" : `${remaining} others`;

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-10 sm:px-6">
      <FadeIn>
        <h2 className="mb-6 text-2xl font-bold sm:text-3xl">Shop by game</h2>
      </FadeIn>
      <StaggerGrid className="grid grid-cols-4 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-6">
        {categories.map((category, i) => (
          <StaggerItem key={category.id} className={i >= MOBILE_COUNT ? "hidden sm:block" : undefined}>
            <Link
              href={`/listings?category=${category.slug}`}
              title={category.name}
              className="glow-border group relative flex h-full flex-col items-center gap-2 overflow-hidden rounded-2xl border border-white/[.07] bg-card/60 p-3 text-center sm:gap-3 sm:p-5 transition-all duration-500 hover:-translate-y-1.5 hover:bg-card active:scale-95"
            >
              <span className="absolute inset-x-0 -top-10 h-24 bg-primary/25 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
              {category.image_url ? (
                <Image src={category.image_url} alt="" width={48} height={48} className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-xl object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" />
              ) : (
                <span className="relative grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-xl bg-primary/15 text-primary transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <Tag className="h-5 w-5" />
                </span>
              )}
              <span className="relative line-clamp-1 text-xs font-semibold sm:text-sm">{category.name}</span>
            </Link>
          </StaggerItem>
        ))}
        {remaining > 0 && (
          <StaggerItem className="sm:hidden">
            <Link
              href="/listings"
              className="group relative flex h-full flex-col items-center gap-2 overflow-hidden rounded-2xl border border-primary/40 bg-primary/10 p-3 text-center transition-all duration-500 active:scale-95"
            >
              <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-[hsl(var(--rose))] text-white">
                <LayoutGrid className="h-5 w-5" />
              </span>
              <span className="relative text-xs font-semibold leading-tight">{othersLabel}</span>
            </Link>
          </StaggerItem>
        )}
      </StaggerGrid>
    </section>
  );
}
