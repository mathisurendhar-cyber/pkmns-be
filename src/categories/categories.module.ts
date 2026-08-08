import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../entities/category.entity';
import { ServiceContact } from '../entities/service-contact.entity';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category, ServiceContact])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
