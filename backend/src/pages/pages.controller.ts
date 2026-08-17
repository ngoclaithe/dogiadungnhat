import { Controller, Get, Param } from '@nestjs/common';
import { PagesService } from './pages.service';

@Controller('pages')
export class PagesController {
  constructor(private readonly pages: PagesService) {}

  @Get()
  findAll() {
    return this.pages.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.pages.findBySlug(slug);
  }
}
