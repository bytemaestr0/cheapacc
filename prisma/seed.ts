import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const category = await prisma.category.upsert({
    where: { slug: "general" },
    update: {},
    create: { name: "General", slug: "general" },
  });

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
      categoryId: category.id,
      stockCount: 5,
      deliveryNotes: "Delivered within 24h after manual review.",
    },
  });

  console.log("Seeded: 1 category, 1 listing");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
