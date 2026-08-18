import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  listOrders() {
    return this.prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    try {
      return await this.prisma.order.update({
        where: { id },
        data: { status },
        include: { items: true },
      });
    } catch {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }
  }

  listPages() {
    return this.prisma.page.findMany({ orderBy: { title: 'asc' } });
  }

  async updatePage(slug: string, data: { title?: string; content?: string }) {
    try {
      return await this.prisma.page.update({
        where: { slug },
        data: {
          title: data.title?.trim(),
          content: data.content,
        },
      });
    } catch {
      throw new NotFoundException('Không tìm thấy trang');
    }
  }

  listPosts() {
    return this.prisma.post.findMany({ orderBy: { publishedAt: 'desc' } });
  }

  async updatePost(
    slug: string,
    data: { title?: string; excerpt?: string; content?: string },
  ) {
    try {
      return await this.prisma.post.update({
        where: { slug },
        data: {
          title: data.title?.trim(),
          excerpt: data.excerpt?.trim(),
          content: data.content,
        },
      });
    } catch {
      throw new NotFoundException('Không tìm thấy bài viết');
    }
  }
}
