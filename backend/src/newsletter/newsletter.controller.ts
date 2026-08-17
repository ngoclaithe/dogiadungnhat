import { Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscribeDto } from './dto/subscribe.dto';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async subscribe(@Body() dto: SubscribeDto) {
    await this.prisma.newsletter.upsert({
      where: { email: dto.email.toLowerCase() },
      update: {},
      create: { email: dto.email.toLowerCase() },
    });
    return { ok: true, message: 'Đã đăng ký nhận khuyến mãi.' };
  }
}
