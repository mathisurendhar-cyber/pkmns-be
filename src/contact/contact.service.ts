import { Injectable } from '@nestjs/common';
import { MailService } from '../common/mail.service';
import { TelegramService } from '../common/telegram.service';
import { UploadService } from '../common/upload.service';

@Injectable()
export class ContactService {
  constructor(
    private readonly mail: MailService,
    private readonly telegram: TelegramService,
    private readonly uploadService: UploadService,
  ) {}

  async contact(
    body: { name?: string; mobile?: string; message?: string },
    files?: Express.Multer.File[],
  ) {
    try {
      const { name, mobile, message } = body;
      if (!name || !mobile || !message) {
        return { success: false, message: 'Missing fields' };
      }

      const attachments =
        files?.map((file) => ({
          filename: file.originalname || 'attachment',
          content: file.buffer,
          contentType: file.mimetype,
        })) || [];

      try {
        await this.mail.sendContactEmail(
          { name, mobile, message },
          attachments,
        );
      } catch (err: any) {
        console.error('Contact SMTP failed:', err?.message || err);
        return {
          success: false,
          message: 'Failed to send email. Check SMTP configuration.',
        };
      }

      // Optional Telegram (do not fail the request if Telegram is unset)
      try {
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
      } catch (err) {
        console.error('Telegram contact notify skipped:', err);
      }

      return { success: true, message: 'Message sent successfully' };
    } catch (err) {
      console.error('Contact error:', err);
      return { success: false, message: 'Failed to send message' };
    }
  }
}
