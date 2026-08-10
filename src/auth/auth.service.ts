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

  // =========================
  // LOGIN STEP 1
  // =========================
  async loginStep1(body: {
    username?: string;
    password?: string;
    email?: string;
  }) {
    const { username, password, email } = body;

    // Validate input
    if (!username || !password || !email) {
      return {
        success: false,
        message: 'All fields required',
      };
    }

    // Find user
    const users = await this.adminRepo.find();

    const user = users.find(
      (u) =>
        u.username?.toLowerCase() === username.toLowerCase() &&
        u.password === password &&
        (u.email || '').toLowerCase() === email.toLowerCase(),
    );

    // Invalid credentials
    if (!user) {
      return {
        success: false,
        message: 'Invalid credentials',
      };
    }

    // Generate 6 digit OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    // OTP expires in 5 minutes
    user.otp = otp;
    user.otpExpiry = String(
      Date.now() + 5 * 60 * 1000,
    );

    // Save OTP
    await this.adminRepo.save(user);

    // Send OTP email
    try {
      await this.mailService.sendOtpEmail(
        email,
        otp,
      );
    } catch (err: any) {
      console.error(
        'OTP email failed:',
        err?.message || err,
      );

      // Remove OTP if email failed
      user.otp = null;
      user.otpExpiry = null;

      await this.adminRepo.save(user);

      return {
        success: false,
        message:
          'Failed to send OTP email. Check SMTP configuration.',
      };
    }

    return {
      success: true,
      message: 'OTP sent to your email',
    };
  }

  // =========================
  // LOGIN STEP 2
  // =========================
  async loginStep2(body: {
    email?: string;
    otp?: string;
  }) {
    const { email, otp } = body;

    // Validate input
    if (!email || !otp) {
      return {
        success: false,
        message: 'Email and OTP required',
      };
    }

    // Find user by email
    const users = await this.adminRepo.find();

    const user = users.find(
      (u) =>
        (u.email || '').toLowerCase() ===
        email.toLowerCase(),
    );

    // OTP not generated
    if (!user || !user.otp) {
      return {
        success: false,
        message: 'OTP not generated',
      };
    }

    // Check expiry
    if (
      !user.otpExpiry ||
      Date.now() > Number(user.otpExpiry)
    ) {
      user.otp = null;
      user.otpExpiry = null;

      await this.adminRepo.save(user);

      return {
        success: false,
        message: 'OTP expired',
      };
    }

    // Check OTP
    if (user.otp !== otp) {
      return {
        success: false,
        message: 'Invalid OTP',
      };
    }

    // OTP successful - clear OTP
    user.otp = null;
    user.otpExpiry = null;

    await this.adminRepo.save(user);

    return {
      success: true,
      message: 'Login successful',
      user: {
        username: user.username,
        name: user.name || user.username,
        email: user.email,
        role: user.role || 'admin',
      },
    };
  }
}