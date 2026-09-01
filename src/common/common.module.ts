import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUser } from '../entities/admin-user.entity';
import { Category } from '../entities/category.entity';
import { MembershipApplication } from '../entities/membership-application.entity';
import { ServiceContact } from '../entities/service-contact.entity';
import { UploadAsset } from '../entities/upload-asset.entity';
import { Visitor } from '../entities/visitor.entity';
import { MailService } from './mail.service';
import { SeedService } from './seed.service';
import { TelegramService } from './telegram.service';
import { UploadService } from './upload.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminUser,
      Category,
      MembershipApplication,
      Visitor,
      ServiceContact,
      UploadAsset,
    ]),
  ],
  providers: [UploadService, TelegramService, SeedService, MailService],
  exports: [UploadService, TelegramService, MailService],
})
export class CommonModule {}
