import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadService } from '../common/upload.service';
import { News } from '../entities/news.entity';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepo: Repository<News>,
    private readonly uploadService: UploadService,
  ) {}

  async create(
    body: { title?: string; content?: string },
    file?: Express.Multer.File,
  ) {
    try {
      const { title, content } = body;
      if (!title || !content) {
        return { success: false, message: 'Missing fields' };
      }
      let image_url: string | undefined;
      if (file) {
        image_url = await this.uploadService.saveFile(file, 'news', 'news');
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

  async findOne(id: string) {
    try {
      const data = await this.newsRepo.findOne({ where: { id: Number(id) } });
      if (!data) return { success: false };
      return data;
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  }

  async update(id: string, body: { title?: string; content?: string }) {
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

  async remove(id: string) {
    try {
      await this.newsRepo.delete({ id: Number(id) });
      return { success: true };
    } catch {
      return { success: false };
    }
  }
}
