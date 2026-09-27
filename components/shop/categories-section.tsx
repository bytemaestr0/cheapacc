import Link from "next/link";
import Image from "next/image";
import { Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export async function CategoriesSection() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, image_url")
    .order("sort_order", { ascending: true });

  if (!categories || categories.length === 0) return null;

  return (
    <section className="border-b border-border py-14">
      <div className="container">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Categories</h1>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/listings?category=${category.slug}`}
              title={category.name}
              className="flex flex-col items-center gap-2 rounded-lg border border-border p-4 text-center transition-colors hover:bg-muted"
            >
              {category.image_url ? (
                <Image
                  src={category.image_url}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-md object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Tag className="h-5 w-5" />
                </div>
              )}
              <span className="line-clamp-1 text-sm text-muted-foreground">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
