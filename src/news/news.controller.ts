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
import { memoryStorage } from 'multer';
import { NewsService } from './news.service';

@Controller('api')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post('news')
  @UseInterceptors(
    FileInterceptor('media', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  create(
    @Body() body: { title?: string; content?: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.newsService.create(body, file);
  }

  @Get('news')
  findAll() {
    return this.newsService.findAll();
  }

  @Get('news/:id')
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  @Put('news/:id')
  update(
    @Param('id') id: string,
    @Body() body: { title?: string; content?: string },
  ) {
    return this.newsService.update(id, body);
  }

  @Delete('news/:id')
  remove(@Param('id') id: string) {
    return this.newsService.remove(id);
  }
}
