const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
const categories = [
  { name: 'Protein', slug: 'protein' },
  { name: 'Gainer', slug: 'gainer' },
  { name: 'Pre Workout', slug: 'pre-workout' },
  { name: 'T-Booster', slug: 't-booster' },
  { name: 'Fish Oil', slug: 'fish-oil' },
  { name: 'Multivitamins', slug: 'multivitamins' },
  { name: 'Creatine', slug: 'creatine' },
  { name: 'EAA/BCAA', slug: 'eaa-bcaa' },
  { name: 'Weight Loss', slug: 'weight-loss' },
  { name: 'Snacks', slug: 'snacks' },
  { name: 'Best Pick', slug: 'best-pick' }
];

async function main() {
  try {
    for (const cat of categories) {
      await p.category.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name },
        create: { name: cat.name, slug: cat.slug }
      });
    }
    console.log('Categories seeded/updated successfully!');
  } catch (e) {
    console.error('Failed to seed categories:', e);
  } finally {
    await p.$disconnect();
  }
}
main();
