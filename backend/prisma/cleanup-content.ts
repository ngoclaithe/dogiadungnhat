import { PrismaClient } from '@prisma/client';
import { sanitizeContent } from '../src/common/sanitize';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, description: true, shortDescription: true },
  });
  for (const product of products) {
    await prisma.product.update({
      where: { id: product.id },
      data: {
        description: product.description
          ? sanitizeContent(product.description)
          : product.description,
        shortDescription: product.shortDescription
          ? sanitizeContent(product.shortDescription)
          : product.shortDescription,
      },
    });
  }

  const posts = await prisma.post.findMany({
    select: { id: true, title: true, excerpt: true, content: true },
  });
  for (const post of posts) {
    await prisma.post.update({
      where: { id: post.id },
      data: {
        title: sanitizeContent(post.title),
        excerpt: post.excerpt ? sanitizeContent(post.excerpt) : post.excerpt,
        content: sanitizeContent(post.content),
      },
    });
  }

  console.log(`Cleaned ${products.length} products and ${posts.length} posts.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
