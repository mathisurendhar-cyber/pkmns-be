import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { TelegramService } from '../common/telegram.service';
import { UploadService } from '../common/upload.service';

@Controller('api')
export class ContactController {
  constructor(
    private readonly telegram: TelegramService,
    private readonly uploadService: UploadService,
  ) {}

  @Post('contact-with-file')
  @UseInterceptors(
    FilesInterceptor('attachments', 10, {
      storage: memoryStorage(),
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  async contact(
    @Body() body: { name?: string; mobile?: string; message?: string },
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    try {
      const { name, mobile, message } = body;
      if (!name || !mobile || !message) {
        return { success: false, message: 'Missing fields' };
      }

      const text =
        `📩 *New Contact Message*\n\n` +
        `👤 *Name:* ${name}\n` +
        `📞 *Mobile:* ${mobile}\n\n` +
        `💬 *Message:*\n${message}`;

      await this.telegram.sendMessage(text, 'Markdown');

      if (files?.length) {
        for (const file of files) {
          const saved = this.uploadService.saveDiskFile(file, 'contact');
          await this.telegram.sendDocument(saved.path);
        }
      }

      return { success: true };
    } catch (err) {
      console.error('Telegram contact error:', err);
      return { success: false };
    }
  }
}
