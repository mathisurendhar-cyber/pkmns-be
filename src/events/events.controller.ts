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
  constructor(
    private readonly eventsService: EventsService,
  ) {}

  // ============================================================
  // CREATE EVENT
  // ============================================================

  @Post('events')
  @UseInterceptors(
    FilesInterceptor('files', 30, {
      storage: memoryStorage(),

      limits: {
        // Maximum 30 files per event
        files: 30,

        // Maximum size per individual file
        // 1 GB
        fileSize: 1024 * 1024 * 1024,
      },

      fileFilter: (
        req,
        file,
        callback,
      ) => {
        const allowedTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
          'image/gif',

          'video/mp4',
          'video/webm',
          'video/quicktime',
          'video/x-msvideo',
          'video/mpeg',
        ];

        if (
          allowedTypes.includes(
            file.mimetype,
          )
        ) {
          callback(null, true);
        } else {
          callback(
            new Error(
              `Unsupported file type: ${file.mimetype}`,
            ),
            false,
          );
        }
      },
    }),
  )
  create(
    @Body()
    body: {
      title?: string;
      date?: string;
      description?: string;
    },

    @UploadedFiles()
    files?: Express.Multer.File[],
  ) {
    return this.eventsService.create(
      body,
      files,
    );
  }

  // ============================================================
  // GET ALL EVENTS
  // ============================================================

  @Get('events')
  findAll() {
    return this.eventsService.findAll();
  }

  // ============================================================
  // UPDATE EVENT
  // ============================================================

  @Put('events/:id')
  update(
    @Param('id') id: string,

    @Body()
    body: {
      title?: string;
      date?: string;
      description?: string;
    },
  ) {
    return this.eventsService.update(
      id,
      body,
    );
  }

  // ============================================================
  // DELETE EVENT
  // ============================================================

  @Delete('events/:id')
  remove(
    @Param('id') id: string,
  ) {
    return this.eventsService.remove(
      id,
    );
  }

  // ============================================================
  // EVENT GALLERY
  // ============================================================

  @Get('events/:id/gallery')
  gallery(
    @Param('id') id: string,
  ) {
    return this.eventsService.gallery(
      id,
    );
  }
}