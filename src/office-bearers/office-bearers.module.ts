import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { OfficeBearer } from '../entities/office-bearer.entity';
import { OfficeBearersController } from './office-bearers.controller';
import { OfficeBearersService } from './office-bearers.service';

@Module({
  imports: [TypeOrmModule.forFeature([OfficeBearer]), CommonModule],
  controllers: [OfficeBearersController],
  providers: [OfficeBearersService],
})
export class OfficeBearersModule {}
