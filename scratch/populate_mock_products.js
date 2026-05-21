const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Seeding mock products and active sale...');

    // 1. Get the categories
    const categories = await prisma.category.findMany();
    const catMap = {};
    categories.forEach(c => {
      catMap[c.slug] = c.id;
    });

    console.log('Available categories in DB:', Object.keys(catMap));

    // Define mock products to create
    const mockProducts = [
      {
        name: 'Kavya Boss Gold Whey Protein',
        slug: 'kb-gold-whey-protein',
        description: 'Premium Ultra-Filtered Whey Protein Concentrate & Isolate Blend for maximum muscle recovery and strength building.',
        price: 3899.00,
        comparePrice: 4999.00,
        stock: 45,
        brand: 'Kavya Boss Nutrition',
        categorySlug: 'protein',
        images: ['https://images.unsplash.com/photo-1593095183571-2d5ff1e47f2c?auto=format&fit=crop&q=80&w=800'],
        isFeatured: true
      },
      {
        name: 'Kavya Boss Mass Gainer Extreme',
        slug: 'kb-mass-gainer-extreme',
        description: 'High-calorie mass gainer packed with high-quality proteins, complex carbohydrates, and essential vitamins for bulking.',
        price: 2999.00,
        comparePrice: 3899.00,
        stock: 30,
        brand: 'Kavya Boss Nutrition',
        categorySlug: 'gainer',
        images: ['https://images.unsplash.com/photo-1593095183571-2d5ff1e47f2c?auto=format&fit=crop&q=80&w=800'],
        isFeatured: true
      },
      {
        name: 'KB Pre-Workout Beast Mode',
        slug: 'kb-pre-workout-beast',
        description: 'Explosive pre-workout formula with L-Citrulline, Beta-Alanine, and Caffeine for extreme energy, pump, and focus.',
        price: 1899.00,
        comparePrice: 2499.00,
        stock: 60,
        brand: 'Kavya Boss Nutrition',
        categorySlug: 'pre-workout',
        images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800'],
        isFeatured: true
      },
      {
        name: 'Kavya Boss Micronized Creatine Monohydrate',
        slug: 'kb-micronized-creatine',
        description: '100% Pure micronized creatine monohydrate to boost muscle strength, power output, and cell hydration.',
        price: 1199.00,
        comparePrice: 1599.00,
        stock: 120,
        brand: 'Kavya Boss Nutrition',
        categorySlug: 'creatine',
        images: ['https://images.unsplash.com/photo-1593095183571-2d5ff1e47f2c?auto=format&fit=crop&q=80&w=800'],
        isFeatured: true
      },
      {
        name: 'KB Daily Multi-Vitamins for Men & Women',
        slug: 'kb-daily-multivitamins',
        description: 'Complete daily multivitamin formula with 25+ essential vitamins, minerals, and herbal extracts for daily immunity and health.',
        price: 799.00,
        comparePrice: 999.00,
        stock: 150,
        brand: 'Kavya Boss Nutrition',
        categorySlug: 'multivitamins',
        images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800'],
        isFeatured: false
      },
      {
        name: 'KB Omega-3 Fish Oil (Triple Strength)',
        slug: 'kb-omega3-fish-oil',
        description: 'Premium mercury-free fish oil capsules rich in EPA and DHA to support heart, brain, joint, and eye health.',
        price: 999.00,
        comparePrice: 1399.00,
        stock: 80,
        brand: 'Kavya Boss Nutrition',
        categorySlug: 'fish-oil',
        images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800'],
        isFeatured: false
      },
      {
        name: 'Kavya Boss Boss Pick Whey Isolate',
        slug: 'kb-boss-pick-isolate',
        description: 'Elite quality 100% Whey Protein Isolate. Zero sugar, low carb, fast absorbing, and high protein content per serving.',
        price: 5499.00,
        comparePrice: 6599.00,
        stock: 40,
        brand: 'Kavya Boss Nutrition',
        categorySlug: 'best-pick',
        images: ['https://images.unsplash.com/photo-1593095183571-2d5ff1e47f2c?auto=format&fit=crop&q=80&w=800'],
        isFeatured: true
      },
      {
        name: 'Kavya Boss Pre-Workout Pro Edition',
        slug: 'kb-pre-workout-pro',
        description: 'Advanced pre-workout formulation for sustained endurance, mental focus, and muscle blood flow.',
        price: 2199.00,
        comparePrice: 2799.00,
        stock: 25,
        brand: 'Kavya Boss Nutrition',
        categorySlug: 'best-pick',
        images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800'],
        isFeatured: true
      }
    ];

    const seededProducts = [];

    for (const item of mockProducts) {
      const categoryId = catMap[item.categorySlug];
      if (!categoryId) {
        console.warn(`Category slug "${item.categorySlug}" not found in database. Skipping product: ${item.name}`);
        continue;
      }

      // Upsert the product
      const product = await prisma.product.upsert({
        where: { slug: item.slug },
        update: {
          name: item.name,
          description: item.description,
          price: item.price,
          comparePrice: item.comparePrice,
          stock: item.stock,
          brand: item.brand,
          categoryId: categoryId,
          images: item.images,
          isFeatured: item.isFeatured
        },
        create: {
          name: item.name,
          slug: item.slug,
          description: item.description,
          price: item.price,
          comparePrice: item.comparePrice,
          stock: item.stock,
          brand: item.brand,
          categoryId: categoryId,
          images: item.images,
          isFeatured: item.isFeatured
        }
      });
      console.log(`- Product seeded: ${product.name}`);
      seededProducts.push(product);
    }

    // 2. Clear any existing sales
    await prisma.sale.deleteMany();
    console.log('Cleared existing sales.');

    // 3. Create a new active sale and connect the Best Pick products
    const bestPickProducts = seededProducts.filter(p => p.slug.includes('boss-pick') || p.slug.includes('pro'));
    const bestPickIds = bestPickProducts.map(p => p.id);

    const sale = await prisma.sale.create({
      data: {
        name: 'Summer Blast Sale 2026',
        announcementText: '⚡ SUMMER BLAST SALE: 20% EXTRA OFF ON ALL BEST-PICK NUTRITION SUPPLEMENTS! ⚡',
        discountPercent: 20,
        isActive: true,
        products: {
          connect: bestPickIds.map(id => ({ id }))
        }
      },
      include: {
        products: true
      }
    });

    console.log(`\nActive Sale Created: "${sale.name}" (${sale.discountPercent}% off)`);
    console.log(`Connected products count: ${sale.products.length}`);
    sale.products.forEach(p => {
      console.log(`  - ${p.name} (Original Price: ₹${p.price})`);
    });

  } catch (err) {
    console.error('Error during seeding mock products:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
