import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as QRCode from 'qrcode';
import { In, Repository } from 'typeorm';
import { MailService } from '../common/mail.service';
import { TelegramService } from '../common/telegram.service';
import { MembershipApplication } from '../entities/membership-application.entity';

@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(MembershipApplication)
    private readonly appRepo: Repository<MembershipApplication>,
    private readonly mail: MailService,
    private readonly telegram: TelegramService,
  ) {}

  async submit(body: { name?: string; mobile?: string; refId?: string }) {
    const { name, mobile, refId } = body;
    if (!name || !mobile || !refId) {
      return { success: false, message: 'Missing data' };
    }

    await this.appRepo.save(
      this.appRepo.create({
        id: Date.now().toString(),
        name,
        mobile,
        refId,
        status: 'pending',
        createdAt: new Date(),
      }),
    );

    try {
      await this.mail.sendMembershipEmail({ name, mobile, refId });
    } catch (err: any) {
      console.error('Membership SMTP failed:', err?.message || err);
      return {
        success: false,
        message: 'Application saved but email failed. Check SMTP configuration.',
      };
    }

    try {
      await this.telegram.sendMessage(
        `🆕 NEW MEMBERSHIP\n👤 ${name}\n📱 ${mobile}\n💳 Ref: ${refId}\n⏳ Pending approval`,
      );
    } catch (err) {
      console.error('Telegram membership notify skipped:', err);
    }

    return { success: true, message: 'Membership submitted successfully' };
  }

  applications() {
    return this.appRepo.find({
      where: { status: In(['pending', 'approved']) },
    });
  }

  async update(id: string, body: { status?: string }) {
    const app = await this.appRepo.findOne({ where: { id } });
    if (!app) return { success: false, message: 'Application not found' };

    app.status = body.status || app.status;
    await this.appRepo.save(app);

    let whatsapp: string | null = null;
    if (body.status === 'approved') {
      const digits = String(app.mobile || '').replace(/\D/g, '');
      const phone = digits.length === 10 ? `91${digits}` : digits;

      const msg =
        `🤝 AmbalNagar Makkal Nalvazhu Sangam 🤝\n\n` +
        `Hello ${app.name} 👋,\n\n` +
        `We are happy to inform you that your membership application has been successfully approved ✅🎉\n\n` +
        `You are now an official member of AmbalNagar Makkal Nalvazhu Sangam 🤍\n\n` +
        `Thank you for joining us.\n` +
        `We look forward to your active participation in our community programs 🌱\n\n` +
        `📍 Stay connected. Stay united.`;

      whatsapp = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

      try {
        await this.telegram.sendMessage(
          `✅ APPROVED\n👤 ${app.name}\n📱 ${app.mobile}`,
        );
      } catch (err) {
        console.error('Telegram approve notify skipped:', err);
      }
    }

    return { success: true, whatsapp };
  }

  async qr(upi: string) {
    const qrData = `upi://pay?pa=${upi}&am=200&cu=INR`;
    const qr = await QRCode.toDataURL(qrData);
    return { success: true, qr };
  }
}
