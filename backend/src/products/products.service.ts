import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProductQueryDto } from './dto/product-query.dto';

const productInclude = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
};

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
        ? [{ price: { sort: 'asc', nulls: 'last' } }]
        : query.sort === 'price_desc'
          ? [{ price: { sort: 'desc', nulls: 'last' } }]
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
      items,
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
    return product;
  }

  async related(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      select: { id: true, categoryId: true },
    });
    if (!product) return [];
    return this.prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: product.id } },
      include: productInclude,
      take: 8,
      orderBy: { featured: 'desc' },
    });
  }

  featured(limit = 8) {
    return this.prisma.product.findMany({
      where: { featured: true },
      include: productInclude,
      take: limit,
      orderBy: { updatedAt: 'desc' },
    });
  }

  byCategory(slug: string, limit = 8) {
    return this.prisma.product.findMany({
      where: { category: { slug } },
      include: productInclude,
      take: limit,
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });
  }
}
