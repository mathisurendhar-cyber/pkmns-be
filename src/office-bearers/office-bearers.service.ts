import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadService } from '../common/upload.service';
import { OfficeBearer } from '../entities/office-bearer.entity';

@Injectable()
export class OfficeBearersService {
  constructor(
    @InjectRepository(OfficeBearer)
    private readonly repo: Repository<OfficeBearer>,
    private readonly uploadService: UploadService,
  ) {}

  async findAll() {
    try {
      return await this.repo.find({ order: { id: 'ASC' } });
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async create(
    body: { name?: string; role?: string },
    file?: Express.Multer.File,
  ) {
    try {
      const { name, role } = body;
      if (!name || !role || !file) {
        return { success: false };
      }
      const image_url = await this.uploadService.saveFile(
        file,
        'office_bearers',
        'office',
      );
      await this.repo.save(this.repo.create({ name, role, image_url }));
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  }

  async remove(id: string) {
    try {
      await this.repo.delete({ id: Number(id) });
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  }
}
