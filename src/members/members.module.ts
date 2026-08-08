import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { Member } from '../entities/member.entity';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';

@Module({
  imports: [TypeOrmModule.forFeature([Member]), CommonModule],
  controllers: [MembersController],
  providers: [MembersService],
})
export class MembersModule {}
