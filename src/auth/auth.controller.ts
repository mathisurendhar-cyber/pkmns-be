import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login-step1')
  loginStep1(
    @Body() body: { username?: string; password?: string; email?: string },
  ) {
    return this.authService.loginStep1(body);
  }

  @Post('login-step2')
  loginStep2(@Body() body: { email?: string; otp?: string }) {
    return this.authService.loginStep2(body);
  }
}
