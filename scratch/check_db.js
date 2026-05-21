const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const productsCount = await prisma.product.count();
    const categoriesCount = await prisma.category.count();
    const salesCount = await prisma.sale.count();
    console.log(`Products: ${productsCount}, Categories: ${categoriesCount}, Sales: ${salesCount}`);

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    console.log('\nCategories list:');
    categories.forEach(c => {
      console.log(`- ${c.name} (${c.slug}): ${c._count.products} products`);
    });

    const activeSale = await prisma.sale.findFirst({
      where: { isActive: true },
      include: { products: true }
    });
    if (activeSale) {
      console.log(`\nActive Sale: "${activeSale.name}" with discount ${activeSale.discountPercent}% has ${activeSale.products.length} products.`);
    } else {
      console.log('\nNo active sale currently.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
