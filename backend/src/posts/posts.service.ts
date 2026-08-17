import { Injectable, NotFoundException } from '@nestjs/common';
import { sanitizeContent } from '../common/sanitize';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const posts = await this.prisma.post.findMany({
      orderBy: { publishedAt: 'desc' },
    });
    return posts.map((post) => ({
      ...post,
      excerpt: post.excerpt ? sanitizeContent(post.excerpt) : post.excerpt,
      content: sanitizeContent(post.content),
      title: sanitizeContent(post.title),
    }));
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.post.findUnique({ where: { slug } });
    if (!post) throw new NotFoundException('Không tìm thấy bài viết');
    return {
      ...post,
      excerpt: post.excerpt ? sanitizeContent(post.excerpt) : post.excerpt,
      content: sanitizeContent(post.content),
      title: sanitizeContent(post.title),
    };
  }
}
