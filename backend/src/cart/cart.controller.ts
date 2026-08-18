import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CartService } from './cart.service';
import { UpsertCartItemDto } from './dto/upsert-cart-item.dto';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  list(@Req() req: { user: { id: string } }) {
    return this.cart.list(req.user.id);
  }

  @Put('items')
  upsert(
    @Req() req: { user: { id: string } },
    @Body() dto: UpsertCartItemDto,
  ) {
    return this.cart.upsert(req.user.id, dto.productId, dto.quantity);
  }

  @Delete('items/:productId')
  remove(
    @Req() req: { user: { id: string } },
    @Param('productId') productId: string,
  ) {
    return this.cart.remove(req.user.id, productId);
  }

  @Delete()
  clear(@Req() req: { user: { id: string } }) {
    return this.cart.clear(req.user.id);
  }
}
