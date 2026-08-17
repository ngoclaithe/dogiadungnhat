import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { sanitizeContent } from '../common/sanitize';
import { PrismaService } from '../prisma/prisma.service';
import { ProductQueryDto } from './dto/product-query.dto';

const productInclude = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
};

function cleanProduct<T extends { description?: string | null; shortDescription?: string | null }>(
  product: T,
): T {
  return {
    ...product,
    description: product.description ? sanitizeContent(product.description) : product.description,
    shortDescription: product.shortDescription
      ? sanitizeContent(product.shortDescription)
      : product.shortDescription,
  };
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ProductQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(48, Math.max(1, query.limit ?? 12));
    const where: Prisma.ProductWhereInput = {};

    if (query.category) {
      where.category = { slug: query.category };
    }
    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { brand: { contains: query.q, mode: 'insensitive' } },
        { shortDescription: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput[] =
      query.sort === 'price_asc'
        ? [{ price: 'asc' }]
        : query.sort === 'price_desc'
          ? [{ price: 'desc' }]
          : query.sort === 'name'
            ? [{ name: 'asc' }]
            : [{ featured: 'desc' }, { createdAt: 'desc' }];

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: productInclude,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: items.map((item) => cleanProduct(item)),
      total,
      page,
      limit,
      pageCount: Math.ceil(total / limit),
    };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: productInclude,
    });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
    return cleanProduct(product);
  }

  async related(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      select: { id: true, categoryId: true },
    });
    if (!product) return [];
    const items = await this.prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: product.id } },
      include: productInclude,
      take: 8,
      orderBy: { featured: 'desc' },
    });
    return items.map((item) => cleanProduct(item));
  }

  async featured(limit = 8) {
    const items = await this.prisma.product.findMany({
      where: { featured: true },
      include: productInclude,
      take: limit,
      orderBy: { updatedAt: 'desc' },
    });
    return items.map((item) => cleanProduct(item));
  }

  async byCategory(slug: string, limit = 8) {
    const items = await this.prisma.product.findMany({
      where: { category: { slug } },
      include: productInclude,
      take: limit,
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });
    return items.map((item) => cleanProduct(item));
  }
}
