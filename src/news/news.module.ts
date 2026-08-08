import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { News } from '../entities/news.entity';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';

@Module({
  imports: [TypeOrmModule.forFeature([News]), CommonModule],
  controllers: [NewsController],
  providers: [NewsService],
})
export class NewsModule {}
