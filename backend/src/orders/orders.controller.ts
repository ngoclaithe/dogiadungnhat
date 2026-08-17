import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.orders.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mine')
  createMine(
    @Body() dto: CreateOrderDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.orders.create(dto, req.user.id);
  }

  @Get('track/:code')
  track(@Param('code') code: string) {
    return this.orders.track(code);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  mine(@Req() req: { user: { id: string } }) {
    return this.orders.mine(req.user.id);
  }
}
