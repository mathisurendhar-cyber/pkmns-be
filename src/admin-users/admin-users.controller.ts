import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';

@Controller('api')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get('users')
  getUsers() {
    return this.adminUsersService.getUsers();
  }

  @Post('addUser')
  addUser(
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
    return this.adminUsersService.addUser(body);
  }

  @Post('updateUser')
  updateUser(
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
    return this.adminUsersService.updateUser(body);
  }

  @Delete('deleteAdmin/:username')
  deleteAdmin(@Param('username') username: string) {
    return this.adminUsersService.deleteAdmin(username);
  }
}
