import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { memoryStorage } from 'multer';
import { Repository } from 'typeorm';
import { UploadService } from '../common/upload.service';
import { OfficeBearer } from '../entities/office-bearer.entity';

@Controller('api')
export class OfficeBearersController {
  constructor(
    @InjectRepository(OfficeBearer)
    private readonly repo: Repository<OfficeBearer>,
    private readonly uploadService: UploadService,
  ) {}

  @Get('office-bearers')
  async findAll() {
    try {
      return await this.repo.find({ order: { id: 'ASC' } });
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  @Post('office-bearers')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async create(
    @Body() body: { name?: string; role?: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      const { name, role } = body;
      if (!name || !role || !file) {
        return { success: false };
      }
      const image_url = this.uploadService.saveFile(
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

  @Delete('office-bearers/:id')
  async remove(@Param('id') id: string) {
    try {
      await this.repo.delete({ id: Number(id) });
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  }
}
