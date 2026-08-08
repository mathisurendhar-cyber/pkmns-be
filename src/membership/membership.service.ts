import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as QRCode from 'qrcode';
import { In, Repository } from 'typeorm';
import { TelegramService } from '../common/telegram.service';
import { MembershipApplication } from '../entities/membership-application.entity';

@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(MembershipApplication)
    private readonly appRepo: Repository<MembershipApplication>,
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
    await this.telegram.sendMessage(
      `🆕 NEW MEMBERSHIP\n👤 ${name}\n📱 ${mobile}\n💳 Ref: ${refId}\n⏳ Pending approval`,
    );
    return { success: true };
  }

  applications() {
    return this.appRepo.find({
      where: { status: In(['pending', 'approved']) },
    });
  }

  async update(id: string, body: { status?: string }) {
    const app = await this.appRepo.findOne({ where: { id } });
    if (!app) return { success: false };

    app.status = body.status || app.status;
    await this.appRepo.save(app);

    let whatsapp: string | null = null;
    if (body.status === 'approved') {
      const msg = `
 🤝 AmbalNagar Makkal Nalvazhu Sangam 🤝

 Hello ${app.name} 👋,

 We are happy to inform you that your *membership application has been successfully approved* ✅🎉

 You are now an official member of *AmbalNagar Makkal Nalvazhu Sangam* 🤍

 Thank you for joining us.
 We look forward to your active participation in our community programs 🌱

 📍 Stay connected. Stay united.
 `;
      whatsapp = `https://wa.me/91${app.mobile}?text=${encodeURIComponent(msg)}`;
      await this.telegram.sendMessage(
        `✅ APPROVED\n👤 ${app.name}\n📱 ${app.mobile}`,
      );
    }
    return { success: true, whatsapp };
  }

  async qr(upi: string) {
    const qrData = `upi://pay?pa=${upi}&am=200&cu=INR`;
    const qr = await QRCode.toDataURL(qrData);
    return { success: true, qr };
  }
}
