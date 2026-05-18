const { PrismaClient } = require('@prisma/client');
try {
  const p = new PrismaClient({
    log: ['error']
  });
  console.log('Successfully created PrismaClient!');
  p.$disconnect();
} catch (e) {
  console.error(e);
}
