import { PrismaClient } from '@prisma/client';

import {
  getReplaceConfirmationToken,
  importPreprodContent,
  parseImportOptions,
} from './preprod-content-lib';

const prisma = new PrismaClient();

async function main() {
  const options = parseImportOptions(process.argv.slice(2));
  const result = await importPreprodContent(prisma, options);

  console.log(JSON.stringify({
    ...result,
    replaceConfirmationToken: result.mode === 'replace' ? getReplaceConfirmationToken() : undefined,
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
