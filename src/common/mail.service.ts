import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {}

  private getTransporter() {
    if (this.transporter) return this.transporter;

    const host = this.config.get<string>('SMTP_HOST');
    const port = parseInt(this.config.get<string>('SMTP_PORT') || '587', 10);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (!host || !user || !pass) {
      throw new Error(
        'SMTP is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS.',
      );
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    return this.transporter;
  }

  async sendOtpEmail(to: string, otp: string) {
    const from =
      this.config.get<string>('SMTP_FROM') ||
      this.config.get<string>('SMTP_USER') ||
      'noreply@example.com';

    const transporter = this.getTransporter();

    await transporter.sendMail({
      from,
      to,
      subject: 'Your Ambal Nagar Admin OTP',
      text: `Your one-time password (OTP) is ${otp}. It expires in 5 minutes. Do not share this code with anyone.`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
          <h2 style="margin:0 0 12px;color:#111827;">Admin Login OTP</h2>
          <p style="margin:0 0 16px;color:#4b5563;">Use this code to complete your secure login. It expires in <strong>5 minutes</strong>.</p>
          <div style="font-size:32px;letter-spacing:8px;font-weight:700;color:#1d4ed8;padding:16px 0;text-align:center;">${otp}</div>
          <p style="margin:16px 0 0;color:#9ca3af;font-size:13px;">If you did not request this, you can ignore this email.</p>
        </div>
      `,
    });
  }
}
