const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  try {
    const config = await p.shippingConfig.findUnique({ where: { id: 'default' } });
    console.log('Shipping config in database:', config);
  } catch (e) {
    console.error('Failed to query config:', e);
  } finally {
    await p.$disconnect();
  }
}
main();
