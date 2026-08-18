import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdatePageDto, UpdatePostDto } from './dto/update-content.dto';

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('orders')
  orders() {
    return this.admin.listOrders();
  }

  @Patch('orders/:id/status')
  updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.admin.updateOrderStatus(id, dto.status);
  }

  @Get('pages')
  pages() {
    return this.admin.listPages();
  }

  @Patch('pages/:slug')
  updatePage(@Param('slug') slug: string, @Body() dto: UpdatePageDto) {
    return this.admin.updatePage(slug, dto);
  }

  @Get('posts')
  posts() {
    return this.admin.listPosts();
  }

  @Patch('posts/:slug')
  updatePost(@Param('slug') slug: string, @Body() dto: UpdatePostDto) {
    return this.admin.updatePost(slug, dto);
  }
}
