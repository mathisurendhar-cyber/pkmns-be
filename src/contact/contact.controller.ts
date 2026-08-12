import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';

import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { ContactService } from './contact.service';

@Controller('api')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
  ) {}

  @Post('contact-with-file')
  @UseInterceptors(
    FilesInterceptor('attachments', 10, {
      storage: memoryStorage(),

      limits: {
        fileSize: 25 * 1024 * 1024,
      },
    }),
  )
  contact(
    @Body()
    body: {
      name?: string;
      mobile?: string;
      message?: string;
    },

    @UploadedFiles()
    files?: Express.Multer.File[],
  ) {
    return this.contactService.contact(body, files);
  }
}