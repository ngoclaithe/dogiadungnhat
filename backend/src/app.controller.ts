import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  health() {
    return { ok: true, service: 'noidia-nhat-api' };
  }

  @Get('sitemap')
  async sitemap() {
    const [categories, products, posts, pages] = await Promise.all([
      this.prisma.category.findMany({
        select: { slug: true, name: true, updatedAt: true },
        orderBy: { navOrder: 'asc' },
      }),
      this.prisma.product.findMany({
        select: { slug: true, name: true, updatedAt: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.post.findMany({
        select: { slug: true, title: true, updatedAt: true },
        orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.page.findMany({
        select: { slug: true, title: true, updatedAt: true },
        orderBy: { title: 'asc' },
      }),
    ]);
    return { categories, products, posts, pages };
  }
}
