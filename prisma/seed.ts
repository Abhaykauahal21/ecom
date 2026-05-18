const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Create Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Whey Protein",
        slug: "whey-protein",
        image: "https://images.unsplash.com/photo-1593095183571-2d5ff1e47f2c?auto=format&fit=crop&q=80&w=400",
      },
    }),
    prisma.category.create({
      data: {
        name: "Pre-Workout",
        slug: "pre-workout",
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=400",
      },
    }),
    prisma.category.create({
      data: {
        name: "Creatine",
        slug: "creatine",
        image: "https://images.unsplash.com/photo-1593095183571-2d5ff1e47f2c?auto=format&fit=crop&q=80&w=400",
      },
    }),
    prisma.category.create({
      data: {
        name: "Vitamins",
        slug: "vitamins",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400",
      },
    }),
  ]);

  // Create Products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Elite Whey Isolate",
        slug: "elite-whey-isolate",
        description: "Pure whey isolate for rapid muscle recovery and growth.",
        price: 4999,
        comparePrice: 5999,
        stock: 50,
        brand: "SuppStore Elite",
        categoryId: categories[0].id,
        images: [
          "https://images.unsplash.com/photo-1593095183571-2d5ff1e47f2c?auto=format&fit=crop&q=80&w=800",
          "https://images.unsplash.com/photo-1579722820308-d74e5719d0a8?auto=format&fit=crop&q=80&w=800",
        ],
        isFeatured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "Nitro Blast Pre-Workout",
        slug: "nitro-blast-pre-workout",
        description: "Explosive energy and laser focus for your toughest workouts.",
        price: 2499,
        comparePrice: 2999,
        stock: 30,
        brand: "NitroX",
        categoryId: categories[1].id,
        images: [
          "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800",
        ],
        isFeatured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "Micronized Creatine Monohydrate",
        slug: "creatine-monohydrate",
        description: "Increase strength and power output with pure creatine.",
        price: 1299,
        stock: 100,
        brand: "SuppStore Essentials",
        categoryId: categories[2].id,
        images: [
          "https://images.unsplash.com/photo-1593095183571-2d5ff1e47f2c?auto=format&fit=crop&q=80&w=800",
        ],
        isFeatured: false,
      },
    }),
    prisma.product.create({
      data: {
        name: "Daily Multi-Vitamin",
        slug: "daily-multi-vitamin",
        description: "Essential vitamins and minerals for overall health and immunity.",
        price: 899,
        comparePrice: 999,
        stock: 200,
        brand: "HealthFirst",
        categoryId: categories[3].id,
        images: [
          "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800",
        ],
        isFeatured: false,
      },
    }),
  ]);

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
