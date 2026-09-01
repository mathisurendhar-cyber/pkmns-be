import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadService } from '../common/upload.service';
import { Event } from '../entities/event.entity';
import { Gallery } from '../entities/gallery.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(Gallery)
    private readonly galleryRepo: Repository<Gallery>,
    private readonly uploadService: UploadService,
  ) {}

  async create(
    body: { title?: string; date?: string; description?: string },
    files?: Express.Multer.File[],
  ) {
    try {
      const { title, date, description } = body;
      if (!title || !date || !description) {
        return { success: false, message: 'Missing required fields' };
      }
      const fileUrls: string[] = [];
      if (files?.length) {
        for (const file of files) {
          fileUrls.push(await this.uploadService.saveFile(file, 'events', 'event'));
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

  async update(
    id: string,
    body: { title?: string; date?: string; description?: string },
  ) {
    try {
      const { title, date, description } = body;
      if (!title || !date || !description || isNaN(new Date(date).getTime())) {
        return { success: false };
      }
      await this.eventRepo.update(
        { id: Number(id) },
        { title, date, description },
      );
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  }

  async remove(id: string) {
    try {
      await this.galleryRepo.delete({ event_id: Number(id) });
      await this.eventRepo.delete({ id: Number(id) });
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  }

  async gallery(id: string) {
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
