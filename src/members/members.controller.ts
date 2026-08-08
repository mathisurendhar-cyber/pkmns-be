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
import { memoryStorage } from 'multer';
import { MembersService } from './members.service';

@Controller('api')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post('addUserWithPhoto')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  addUserWithPhoto(
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
    return this.membersService.addUserWithPhoto(body, file);
  }

  @Get('getUsers')
  getUsers() {
    return this.membersService.getUsers();
  }

  @Post('updateUserWithPhoto')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  updateUserWithPhoto(
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
    return this.membersService.updateUserWithPhoto(body, file);
  }

  @Delete('deleteUser/:id')
  deleteUser(@Param('id') id: string) {
    return this.membersService.deleteUser(id);
  }
}
