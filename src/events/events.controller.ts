import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { EventsService } from './events.service';

@Controller('api')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('events')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: memoryStorage(),
      limits: { fileSize: 500 * 1024 * 1024 },
    }),
  )
  create(
    @Body() body: { title?: string; date?: string; description?: string },
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.eventsService.create(body, files);
  }

  @Get('events')
  findAll() {
    return this.eventsService.findAll();
  }

  @Put('events/:id')
  update(
    @Param('id') id: string,
    @Body() body: { title?: string; date?: string; description?: string },
  ) {
    return this.eventsService.update(id, body);
  }

  @Delete('events/:id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Get('events/:id/gallery')
  gallery(@Param('id') id: string) {
    return this.eventsService.gallery(id);
  }
}
