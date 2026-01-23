import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { mairieConfig } from '@villiers-adam/shared';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@mairie.fr';
  const adminPassword = 'ChangeMe123!';

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
      siteName: mairieConfig.commune.nomComplet,
      branding: mairieConfig.branding,
      accessibility: {
        seniorMode: true,
        dyslexicMode: false,
        nightMode: true,
      },
      contactEmail: mairieConfig.mairie.contact.email,
      contactPhone: mairieConfig.mairie.contact.telephone,
      address: mairieConfig.mairie.adresse,
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
