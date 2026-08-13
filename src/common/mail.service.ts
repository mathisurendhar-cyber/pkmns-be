import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export type MailAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

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

  private resolveFromAddress() {
    const user = this.config.get<string>('SMTP_USER') || '';
    let from =
      this.config.get<string>('SMTP_FROM') ||
      user ||
      'noreply@example.com';

    if (!from.includes('@')) {
      from = user ? `"${from}" <${user}>` : from;
    } else if (!from.includes('<')) {
      const match = from.match(/^(.+?)\s+([\w.+-]+@[\w.-]+\.\w+)$/);
      if (match) {
        from = `"${match[1].trim()}" <${match[2]}>`;
      }
    }

    return from;
  }

  /** Inbox that receives contact + membership notifications */
  getNotifyEmail() {
    return (
      this.config.get<string>('SMTP_TO') ||
      this.config.get<string>('CONTACT_EMAIL') ||
      this.config.get<string>('SMTP_USER') ||
      ''
    );
  }

  async sendOtpEmail(to: string, otp: string) {
    const from = this.resolveFromAddress();
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

  async sendContactEmail(
    data: { name: string; mobile: string; message: string },
    attachments: MailAttachment[] = [],
  ) {
    const to = this.getNotifyEmail();
    if (!to) throw new Error('No SMTP_TO / SMTP_USER configured');

    const from = this.resolveFromAddress();
    const transporter = this.getTransporter();

    await transporter.sendMail({
      from,
      to,
      subject: `New Contact Message — ${data.name}`,
      text: `Name: ${data.name}\nMobile: ${data.mobile}\n\nMessage:\n${data.message}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
          <h2 style="margin:0 0 8px;color:#bc3208;">New Contact Message</h2>
          <p style="margin:0 0 16px;color:#6b7280;">Submitted from the website contact form.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:8px 0;color:#6b7280;width:100px;">Name</td><td style="padding:8px 0;color:#111827;font-weight:700;">${escapeHtml(data.name)}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;">Mobile</td><td style="padding:8px 0;color:#111827;font-weight:700;">${escapeHtml(data.mobile)}</td></tr>
          </table>
          <div style="margin-top:16px;padding:16px;background:#f8fafc;border-radius:10px;color:#374151;white-space:pre-wrap;">${escapeHtml(data.message)}</div>
          ${
            attachments.length
              ? `<p style="margin:16px 0 0;color:#9ca3af;font-size:13px;">${attachments.length} attachment(s) included.</p>`
              : ''
          }
        </div>
      `,
      attachments: attachments.map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
      })),
    });
  }

  async sendMembershipEmail(data: {
    name: string;
    mobile: string;
    refId: string;
  }) {
    const to = this.getNotifyEmail();
    if (!to) throw new Error('No SMTP_TO / SMTP_USER configured');

    const from = this.resolveFromAddress();
    const transporter = this.getTransporter();

    await transporter.sendMail({
      from,
      to,
      subject: `New Membership Application — ${data.name}`,
      text: `New membership application\n\nName: ${data.name}\nMobile: ${data.mobile}\nPayment Ref: ${data.refId}\nStatus: Pending approval`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
          <h2 style="margin:0 0 8px;color:#bc3208;">New Membership Application</h2>
          <p style="margin:0 0 16px;color:#6b7280;">A member paid ₹200 and submitted the form. Please review in admin.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:8px 0;color:#6b7280;width:120px;">Name</td><td style="padding:8px 0;color:#111827;font-weight:700;">${escapeHtml(data.name)}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;">Mobile</td><td style="padding:8px 0;color:#111827;font-weight:700;">${escapeHtml(data.mobile)}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;">Payment Ref</td><td style="padding:8px 0;color:#ea580c;font-weight:700;">${escapeHtml(data.refId)}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;">Status</td><td style="padding:8px 0;color:#16a34a;font-weight:700;">Pending</td></tr>
          </table>
        </div>
      `,
    });
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
