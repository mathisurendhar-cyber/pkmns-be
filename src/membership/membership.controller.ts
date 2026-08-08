import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { MembershipService } from './membership.service';

@Controller('api')
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Post('submit-membership')
  submit(@Body() body: { name?: string; mobile?: string; refId?: string }) {
    return this.membershipService.submit(body);
  }

  @Get('admin/applications')
  applications() {
    return this.membershipService.applications();
  }

  @Post('admin/update/:id')
  update(@Param('id') id: string, @Body() body: { status?: string }) {
    return this.membershipService.update(id, body);
  }

  @Get('qr')
  qr(@Query('upi') upi: string) {
    return this.membershipService.qr(upi);
  }
}
