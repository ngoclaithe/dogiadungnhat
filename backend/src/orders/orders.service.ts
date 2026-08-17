import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto, userId?: string) {
    const products = await this.prisma.product.findMany({
      where: { id: { in: dto.items.map((i) => i.productId) } },
    });
    if (products.length !== dto.items.length) {
      throw new BadRequestException('Một số sản phẩm không còn tồn tại');
    }

    const items = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const price = product.price ?? 0;
      return {
        productId: product.id,
        name: product.name,
        price,
        quantity: item.quantity,
      };
    });
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const code = await this.nextCode();

    return this.prisma.order.create({
      data: {
        code,
        customerName: dto.customerName,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        note: dto.note,
        total,
        userId,
        items: { create: items },
      },
      include: { items: true },
    });
  }

  async track(code: string) {
    const order = await this.prisma.order.findUnique({
      where: { code: code.trim().toUpperCase() },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return order;
  }

  mine(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async nextCode() {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const prefix = `ND${y}${m}${d}`;
    const count = await this.prisma.order.count({
      where: { code: { startsWith: prefix } },
    });
    return `${prefix}${String(count + 1).padStart(3, '0')}`;
  }
}
