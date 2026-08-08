import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import FormData from 'form-data';
import { createReadStream } from 'fs';

@Injectable()
export class TelegramService {
  constructor(private readonly config: ConfigService) {}

  private get token() {
    return this.config.get<string>('TELEGRAM_BOT_TOKEN') || '';
  }

  private get chatId() {
    return this.config.get<string>('TELEGRAM_CHAT_ID') || '';
  }

  async sendMessage(text: string, parseMode?: string) {
    if (!this.token || !this.chatId) {
      console.warn('Telegram not configured');
      return;
    }
    try {
      const body: Record<string, string> = {
        chat_id: this.chatId,
        text,
      };
      if (parseMode) body.parse_mode = parseMode;
      await axios.post(
        `https://api.telegram.org/bot${this.token}/sendMessage`,
        body,
      );
    } catch (err: any) {
      console.error('Telegram error:', err.message);
    }
  }

  async sendDocument(filePath: string) {
    if (!this.token || !this.chatId) return;
    try {
      const formData = new FormData();
      formData.append('chat_id', this.chatId);
      formData.append('document', createReadStream(filePath));
      await axios.post(
        `https://api.telegram.org/bot${this.token}/sendDocument`,
        formData,
        { headers: formData.getHeaders() },
      );
    } catch (err: any) {
      console.error('Telegram document error:', err.message);
    }
  }
}
