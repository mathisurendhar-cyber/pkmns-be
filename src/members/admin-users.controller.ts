import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser } from '../entities/admin-user.entity';

@Controller('api')
export class AdminUsersController {
  constructor(
    @InjectRepository(AdminUser)
    private readonly adminRepo: Repository<AdminUser>,
  ) {}

  @Get('users')
  async getUsers() {
    const users = await this.adminRepo.find();
    return users.map((u) => ({
      username: u.username,
      password: u.password,
      role: u.role,
      name: u.name,
      email: u.email,
      phone: u.phone,
      joined: u.joined,
      avatar: u.avatar,
      photo: u.photo,
      otp: u.otp,
      otpExpiry: u.otpExpiry,
    }));
  }

  @Post('addUser')
  async addUser(
    @Body()
    body: {
      username?: string;
      password?: string;
      role?: string;
      phone?: string;
      joined?: string;
      email?: string;
      avatar?: string;
    },
  ) {
    const { username, password, role, phone, joined, email, avatar } = body;
    if (!username) {
      return { success: false, message: 'Username required' };
    }
    const exists = await this.adminRepo.findOne({ where: { username } });
    if (exists) {
      return { success: false, message: 'Username already exists' };
    }
    await this.adminRepo.save(
      this.adminRepo.create({
        username,
        password: password || '',
        role: role || 'admin',
        phone: phone || '',
        joined: joined || '',
        email: email || '',
        avatar: avatar || 'img/avatar1.png',
        otp: null,
        otpExpiry: null,
      }),
    );
    return { success: true };
  }

  @Post('updateUser')
  async updateUser(
    @Body()
    body: {
      username?: string;
      password?: string;
      role?: string;
      phone?: string;
      joined?: string;
      email?: string;
      avatar?: string;
    },
  ) {
    const user = await this.adminRepo.findOne({
      where: { username: body.username },
    });
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    if (body.role !== undefined) user.role = body.role;
    if (body.phone !== undefined) user.phone = body.phone;
    if (body.joined !== undefined) user.joined = body.joined;
    if (body.email !== undefined) user.email = body.email;
    if (body.avatar !== undefined) user.avatar = body.avatar;
    if (body.password) user.password = body.password;
    await this.adminRepo.save(user);
    return { success: true };
  }

  @Delete('deleteAdmin/:username')
  async deleteAdmin(@Param('username') username: string) {
    if (username === 'mainadmin') {
      return { success: false, message: 'Cannot delete mainadmin' };
    }
    await this.adminRepo.delete({ username });
    return { success: true };
  }
}
