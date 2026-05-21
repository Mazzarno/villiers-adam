import { Prisma, PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const isProduction = process.env.NODE_ENV === 'production';
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@mairie.fr';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? (isProduction ? undefined : 'ChangeMe123!');

  if (!adminPassword) {
    throw new Error('SEED_ADMIN_PASSWORD is required in production');
  }

  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.warn('Using default development admin password. Set SEED_ADMIN_PASSWORD to override.');
  }

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: await argon2.hash(adminPassword),
      firstName: 'Admin',
      lastName: 'Mairie',
      role: 'SUPER_ADMIN',
    },
  });

  await prisma.settings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'Mairie',
      branding: {} as Prisma.InputJsonValue,
      accessibility: {
        seniorMode: true,
        dyslexicMode: false,
        nightMode: true,
      } as Prisma.InputJsonValue,
      contactEmail: null,
      contactPhone: null,
      address: Prisma.JsonNull,
      municipalityProfile: Prisma.JsonNull,
    },
  });
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
