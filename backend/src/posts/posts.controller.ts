import { Controller, Get, Param } from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Get()
  findAll() {
    return this.posts.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.posts.findBySlug(slug);
  }
}
