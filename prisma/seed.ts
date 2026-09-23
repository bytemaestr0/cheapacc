import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Keep these slugs in sync with lib/categories.ts — that file drives the
// icons/labels shown in the UI, this seeds the matching DB rows so
// listings can actually be assigned to them.
const CATEGORY_SEEDS = [
  { name: "Steam", slug: "steam" },
  { name: "Valorant", slug: "valorant" },
  { name: "CS:GO", slug: "csgo" },
  { name: "Minecraft", slug: "minecraft" },
  { name: "Fortnite", slug: "fortnite" },
  { name: "Other", slug: "other" },
];

async function main() {
  const categories = await Promise.all(
    CATEGORY_SEEDS.map((c) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        update: { name: c.name },
        create: c,
      })
    )
  );

  const other = categories.find((c) => c.slug === "other")!;
  const steam = categories.find((c) => c.slug === "steam")!;

  await prisma.listing.upsert({
    where: { slug: "starter-listing" },
    update: {},
    create: {
      title: "Starter listing",
      slug: "starter-listing",
      description:
        "Example listing so you can see the storefront rendering end to end. Edit or delete this from /admin/listings.",
      priceCents: 1999,
      currency: "USD",
      status: "active",
      categoryId: steam.id,
      stockCount: 5,
      deliveryNotes: "Delivered within 24h after manual review.",
    },
  });

  await prisma.listing.upsert({
    where: { slug: "misc-starter-listing" },
    update: {},
    create: {
      title: "Misc starter listing",
      slug: "misc-starter-listing",
      description:
        "A second example listing filed under \"Other\" so the category grouping has more than one section to show.",
      priceCents: 999,
      currency: "USD",
      status: "active",
      categoryId: other.id,
      stockCount: 3,
      deliveryNotes: "Delivered within 24h after manual review.",
    },
  });

  console.log(`Seeded: ${categories.length} categories, 2 listings`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
