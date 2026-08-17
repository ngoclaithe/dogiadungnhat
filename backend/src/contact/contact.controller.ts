import { Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async create(@Body() dto: CreateContactDto) {
    await this.prisma.contactMessage.create({ data: dto });
    return { ok: true, message: 'Đã nhận yêu cầu, chúng tôi sẽ liên hệ sớm.' };
  }
}
