import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { memoryStorage } from 'multer';
import { Repository } from 'typeorm';
import { UploadService } from '../common/upload.service';
import { News } from '../entities/news.entity';

@Controller('api')
export class NewsController {
  constructor(
    @InjectRepository(News)
    private readonly newsRepo: Repository<News>,
    private readonly uploadService: UploadService,
  ) {}

  @Post('news')
  @UseInterceptors(
    FileInterceptor('media', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async create(
    @Body() body: { title?: string; content?: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      const { title, content } = body;
      if (!title || !content) {
        return { success: false, message: 'Missing fields' };
      }
      let image_url: string | undefined;
      if (file) {
        image_url = this.uploadService.saveFile(file, 'news', 'news');
      }
      await this.newsRepo.save(
        this.newsRepo.create({ title, content, image_url }),
      );
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  }

  @Get('news')
  async findAll() {
    try {
      const news = await this.newsRepo.find({
        order: { created_at: 'DESC' },
      });
      return { news: news || [] };
    } catch (err) {
      console.error(err);
      return { news: [] };
    }
  }

  @Get('news/:id')
  async findOne(@Param('id') id: string) {
    try {
      const data = await this.newsRepo.findOne({ where: { id: Number(id) } });
      if (!data) return { success: false };
      return data;
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  }

  @Put('news/:id')
  async update(
    @Param('id') id: string,
    @Body() body: { title?: string; content?: string },
  ) {
    try {
      await this.newsRepo.update(
        { id: Number(id) },
        { title: body.title, content: body.content },
      );
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  @Delete('news/:id')
  async remove(@Param('id') id: string) {
    try {
      await this.newsRepo.delete({ id: Number(id) });
      return { success: true };
    } catch {
      return { success: false };
    }
  }
}
