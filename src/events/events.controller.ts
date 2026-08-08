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
import { InjectRepository } from '@nestjs/typeorm';
import { memoryStorage } from 'multer';
import { Repository } from 'typeorm';
import { UploadService } from '../common/upload.service';
import { Event } from '../entities/event.entity';
import { Gallery } from '../entities/gallery.entity';

@Controller('api')
export class EventsController {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(Gallery)
    private readonly galleryRepo: Repository<Gallery>,
    private readonly uploadService: UploadService,
  ) {}

  @Post('events')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async create(
    @Body() body: { title?: string; date?: string; description?: string },
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    try {
      const { title, date, description } = body;
      if (!title || !date || !description) {
        return { success: false, message: 'Missing required fields' };
      }
      const fileUrls: string[] = [];
      if (files?.length) {
        for (const file of files) {
          fileUrls.push(this.uploadService.saveFile(file, 'events', 'event'));
        }
      }
      const event = await this.eventRepo.save(
        this.eventRepo.create({ title, date, description, files: fileUrls }),
      );
      for (const url of fileUrls) {
        await this.galleryRepo.save(
          this.galleryRepo.create({ event_id: event.id, url }),
        );
      }
      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, message: err.message };
    }
  }

  @Get('events')
  async findAll() {
    try {
      const data = await this.eventRepo.find({ order: { date: 'ASC' } });
      return {
        events: data.map((e) => ({
          id: e.id,
          title: e.title,
          date: e.date,
          description: e.description,
          files: Array.isArray(e.files) ? e.files : [],
        })),
      };
    } catch (err) {
      console.error(err);
      return { events: [] };
    }
  }

  @Put('events/:id')
  async update(
    @Param('id') id: string,
    @Body() body: { title?: string; date?: string; description?: string },
  ) {
    try {
      const { title, date, description } = body;
      if (!title || !date || !description || isNaN(new Date(date).getTime())) {
        return { success: false };
      }
      await this.eventRepo.update({ id: Number(id) }, {
        title,
        date,
        description,
      });
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  }

  @Delete('events/:id')
  async remove(@Param('id') id: string) {
    try {
      await this.galleryRepo.delete({ event_id: Number(id) });
      await this.eventRepo.delete({ id: Number(id) });
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  }

  @Get('events/:id/gallery')
  async gallery(@Param('id') id: string) {
    try {
      const data = await this.galleryRepo.find({
        where: { event_id: Number(id) },
        order: { created_at: 'ASC' },
      });
      return { files: data || [] };
    } catch (err) {
      console.error(err);
      return { files: [] };
    }
  }
}
