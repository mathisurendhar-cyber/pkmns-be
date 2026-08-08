import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { MembershipApplication } from '../entities/membership-application.entity';
import { MembershipController } from './membership.controller';
import { MembershipService } from './membership.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MembershipApplication]),
    CommonModule,
  ],
  controllers: [MembershipController],
  providers: [MembershipService],
})
export class MembershipModule {}
