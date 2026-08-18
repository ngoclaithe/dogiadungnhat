import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const cartInclude = {
  product: {
    include: {
      images: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
    },
  },
};

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private toItem(row: {
    productId: string;
    quantity: number;
    product: {
      slug: string;
      name: string;
      price: number | null;
      inStock: boolean;
      images: { url: string }[];
    };
  }) {
    return {
      productId: row.productId,
      slug: row.product.slug,
      name: row.product.name,
      price: row.product.price,
      image: row.product.images[0]?.url ?? null,
      quantity: row.quantity,
      inStock: row.product.inStock,
    };
  }

  async list(userId: string) {
    const rows = await this.prisma.cartItem.findMany({
      where: { userId },
      include: cartInclude,
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map((row) => this.toItem(row));
  }

  async upsert(userId: string, productId: string, quantity: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
    if (!product.inStock) {
      throw new BadRequestException('Sản phẩm đang tạm hết hàng');
    }

    if (quantity <= 0) {
      await this.prisma.cartItem.deleteMany({
        where: { userId, productId },
      });
      return this.list(userId);
    }

    await this.prisma.cartItem.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId, quantity },
      update: { quantity },
    });

    return this.list(userId);
  }

  async remove(userId: string, productId: string) {
    await this.prisma.cartItem.deleteMany({
      where: { userId, productId },
    });
    return this.list(userId);
  }

  async clear(userId: string) {
    await this.prisma.cartItem.deleteMany({ where: { userId } });
    return [];
  }
}
