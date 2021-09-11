import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.reactionReference.upsert({
    where: { name: 'like' },
    update: {},
    create: { name: 'like' },
  });
  await prisma.reactionReference.upsert({
    where: { name: 'dislike' },
    update: {},
    create: { name: 'dislike' },
  });
  await prisma.reactionReference.upsert({
    where: { name: 'love' },
    update: {},
    create: { name: 'love' },
  });
  await prisma.reactionReference.upsert({
    where: { name: 'sad' },
    update: {},
    create: { name: 'sad' },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
