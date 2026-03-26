import { prisma } from './src/index.js';

async function main() {
  const space = await prisma.space.findFirst();
  if (space) {
    console.log(`Found existing space: ${space.id}`);
  } else {
    // We need to create an org and a space
    const org = await prisma.organization.create({
      data: {
        name: 'Test Org',
      }
    });

    const newSpace = await prisma.space.create({
      data: {
        name: 'Test Space',
        slug: 'test-space-' + Date.now(),
        orgId: org.id
      }
    });
    console.log(`Created new space: ${newSpace.id}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
