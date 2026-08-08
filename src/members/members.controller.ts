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
import { Member } from '../entities/member.entity';

@Controller('api')
export class MembersController {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    private readonly uploadService: UploadService,
  ) {}

  @Post('addUserWithPhoto')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async addUserWithPhoto(
    @Body()
    body: {
      username?: string;
      phone?: string;
      role?: string;
      joined?: string;
      address?: string;
    },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      const { username, phone, role, joined, address } = body;
      if (!username) {
        return { success: false, message: 'Username required' };
      }
      let photo_url: string | null = null;
      if (file) {
        photo_url = this.uploadService.saveFile(file, 'members', `member_${username}`);
      }
      await this.memberRepo.save(
        this.memberRepo.create({
          username,
          phone,
          role: role || 'member',
          joined,
          address,
          photo_url: photo_url || undefined,
        }),
      );
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Add member failed' };
    }
  }

  @Get('getUsers')
  async getUsers() {
    try {
      return await this.memberRepo.find({
        order: { created_at: 'DESC' },
      });
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  @Post('updateUserWithPhoto')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async updateUserWithPhoto(
    @Body()
    body: {
      id?: string;
      username?: string;
      phone?: string;
      role?: string;
      joined?: string;
    },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      if (!body.id) {
        return { success: false, message: 'ID required' };
      }
      const member = await this.memberRepo.findOne({
        where: { id: Number(body.id) },
      });
      if (!member) return { success: false };

      member.username = body.username ?? member.username;
      member.phone = body.phone ?? member.phone;
      member.role = body.role ?? member.role;
      member.joined = body.joined ?? member.joined;

      if (file) {
        member.photo_url = this.uploadService.saveFile(
          file,
          'members',
          `member_${body.username || member.username}`,
        );
      }
      await this.memberRepo.save(member);
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  }

  @Delete('deleteUser/:id')
  async deleteUser(@Param('id') id: string) {
    try {
      await this.memberRepo.delete({ id: Number(id) });
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  }
}
