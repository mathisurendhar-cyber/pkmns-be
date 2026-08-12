import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailService } from '../common/mail.service';
import { AdminUser } from '../entities/admin-user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AdminUser)
    private readonly adminRepo: Repository<AdminUser>,
    private readonly mailService: MailService,
  ) {}

  async loginStep1(body: {
    username?: string;
    password?: string;
    email?: string;
  }) {
    const { username, password, email } = body;
    if (!username || !password || !email) {
      return { success: false, message: 'All fields required' };
    }

    const users = await this.adminRepo.find();
    const user = users.find(
      (u) =>
        u.username?.toLowerCase() === username.toLowerCase() &&
        u.password === password &&
        (u.email || '').toLowerCase() === email.toLowerCase(),
    );

    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = String(Date.now() + 5 * 60 * 1000);
    await this.adminRepo.save(user);

    try {
      await this.mailService.sendOtpEmail(email, otp);
    } catch (err: any) {
      console.error('OTP email failed:', err?.message || err);
      user.otp = null;
      user.otpExpiry = null;
      await this.adminRepo.save(user);
      return {
        success: false,
        message: 'Failed to send OTP email. Check SMTP configuration.',
      };
    }

    return { success: true, message: 'OTP sent to your email' };
  }

  async loginStep2(body: { email?: string; otp?: string }) {
    const { email, otp } = body;
    if (!email || !otp) {
      return { success: false, message: 'Email and OTP required' };
    }

    const users = await this.adminRepo.find();
    const user = users.find(
      (u) => (u.email || '').toLowerCase() === email.toLowerCase(),
    );

    if (!user || !user.otp) {
      return { success: false, message: 'OTP not generated' };
    }

    if (Date.now() > Number(user.otpExpiry)) {
      user.otp = null;
      user.otpExpiry = null;
      await this.adminRepo.save(user);
      return { success: false, message: 'OTP expired' };
    }

    if (user.otp !== otp) {
      return { success: false, message: 'Invalid OTP' };
    }

    user.otp = null;
    user.otpExpiry = null;
    await this.adminRepo.save(user);

    return {   
      success: true,
      user: {
        username: user.username,
        name: user.name || user.username,
        email: user.email,
        role: user.role || 'admin',
      },
    };
  }
}
