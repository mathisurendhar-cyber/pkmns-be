import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { AdminUser } from '../entities/admin-user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([AdminUser]), CommonModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
