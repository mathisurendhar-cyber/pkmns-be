import { Body, Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser } from '../entities/admin-user.entity';

@Controller('api')
export class AuthController {
  constructor(
    @InjectRepository(AdminUser)
    private readonly adminRepo: Repository<AdminUser>,
  ) {}

  @Post('login-step1')
  async loginStep1(
    @Body() body: { username?: string; password?: string; email?: string },
  ) {
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

    return { success: true, message: 'OTP generated', otp };
  }

  @Post('login-step2')
  async loginStep2(@Body() body: { email?: string; otp?: string }) {
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
