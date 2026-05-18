const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
    console.log("PRODUCTS_START");
    console.log(JSON.stringify(products, null, 2));
    console.log("PRODUCTS_END");
  } catch (err) {
    console.error("ERROR_START");
    console.error(err);
    console.error("ERROR_END");
  } finally {
    await prisma.$disconnect();
  }
}

main();
