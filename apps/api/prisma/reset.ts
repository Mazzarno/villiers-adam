import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Suppression de toutes les données...\n');

  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename != '_prisma_migrations'`;

  for (const { tablename } of tablenames) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE`);
    console.log(`  ✓ ${tablename}`);
  }

  console.log('\nToutes les données ont été supprimées.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
