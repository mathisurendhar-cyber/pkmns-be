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
import { OfficeBearersService } from './office-bearers.service';

@Controller('api')
export class OfficeBearersController {
  constructor(private readonly officeBearersService: OfficeBearersService) {}

  @Get('office-bearers')
  findAll() {
    return this.officeBearersService.findAll();
  }

  @Post('office-bearers')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  create(
    @Body() body: { name?: string; role?: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.officeBearersService.create(body, file);
  }

  @Delete('office-bearers/:id')
  remove(@Param('id') id: string) {
    return this.officeBearersService.remove(id);
  }
}
