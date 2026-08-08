import { Controller, Get } from '@nestjs/common';
import { VisitorsService } from './visitors.service';

@Controller('api')
export class VisitorsController {
  constructor(private readonly visitorsService: VisitorsService) {}

  @Get('visitors')
  visitors() {
    return this.visitorsService.visitors();
  }
}
