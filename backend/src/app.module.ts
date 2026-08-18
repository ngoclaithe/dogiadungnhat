import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { CategoriesModule } from './categories/categories.module';
import { ContactModule } from './contact/contact.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { OrdersModule } from './orders/orders.module';
import { PagesModule } from './pages/pages.module';
import { PostsModule } from './posts/posts.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CategoriesModule,
    ProductsModule,
    PostsModule,
    PagesModule,
    AuthModule,
    AdminModule,
    CartModule,
    OrdersModule,
    ContactModule,
    NewsletterModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
