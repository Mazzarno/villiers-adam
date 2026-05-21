import { PrismaClient } from '@prisma/client';

import {
  buildPreprodContentExport,
  writePreprodContentExportFile,
} from './preprod-content-lib';

const prisma = new PrismaClient();

async function main() {
  const payload = await buildPreprodContentExport(prisma);
  const filePath = await writePreprodContentExportFile(payload);

  console.log(JSON.stringify({
    filePath,
    schemaVersion: payload.schemaVersion,
    exportedAt: payload.exportedAt,
    collections: Object.fromEntries(
      Object.entries(payload.collections).map(([key, value]) => [
        key,
        Array.isArray(value) ? value.length : value ? 1 : 0,
      ]),
    ),
    excludedCollections: payload.excludedCollections,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
