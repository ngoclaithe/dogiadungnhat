import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductQueryDto } from './dto/product-query.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  findAll(@Query() query: ProductQueryDto) {
    return this.products.findAll(query);
  }

  @Get('featured')
  featured() {
    return this.products.featured();
  }

  @Get('by-category/:slug')
  byCategory(@Param('slug') slug: string) {
    return this.products.byCategory(slug);
  }

  @Get(':slug/related')
  related(@Param('slug') slug: string) {
    return this.products.related(slug);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.products.findBySlug(slug);
  }
}
