import { PrismaClient } from '@prisma/client';
import { seedUser } from './user.seed';

const prisma = new PrismaClient();

async function main() {
  await seedUser(prisma);
  console.log('[+] User created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
