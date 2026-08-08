import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth/auth.controller';
import { CategoriesController } from './categories/categories.controller';
import { SeedService } from './common/seed.service';
import { TelegramService } from './common/telegram.service';
import { UploadService } from './common/upload.service';
import { ContactController } from './contact/contact.controller';
import { AdminUser } from './entities/admin-user.entity';
import { Category } from './entities/category.entity';
import { Event } from './entities/event.entity';
import { Gallery } from './entities/gallery.entity';
import { Member } from './entities/member.entity';
import { MembershipApplication } from './entities/membership-application.entity';
import { News } from './entities/news.entity';
import { OfficeBearer } from './entities/office-bearer.entity';
import { ServiceContact } from './entities/service-contact.entity';
import { Visitor } from './entities/visitor.entity';
import { EventsController } from './events/events.controller';
import { AdminUsersController } from './members/admin-users.controller';
import { MembersController } from './members/members.controller';
import { MembershipController } from './membership/membership.controller';
import { NewsController } from './news/news.controller';
import { OfficeBearersController } from './office-bearers/office-bearers.controller';
import { VisitorsController } from './visitors/visitors.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST') || 'localhost',
        port: parseInt(config.get<string>('DB_PORT') || '5432', 10),
        username: config.get<string>('DB_USERNAME') || 'postgres',
        password: config.get<string>('DB_PASSWORD') || 'root',
        database: config.get<string>('DB_DATABASE') || 'pkmns',
        entities: [
          AdminUser,
          Member,
          Event,
          Gallery,
          News,
          OfficeBearer,
          Category,
          ServiceContact,
          MembershipApplication,
          Visitor,
        ],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([
      AdminUser,
      Member,
      Event,
      Gallery,
      News,
      OfficeBearer,
      Category,
      ServiceContact,
      MembershipApplication,
      Visitor,
    ]),
  ],
  controllers: [
    AuthController,
    AdminUsersController,
    MembersController,
    EventsController,
    NewsController,
    OfficeBearersController,
    CategoriesController,
    MembershipController,
    ContactController,
    VisitorsController,
  ],
  providers: [UploadService, TelegramService, SeedService],
})
export class AppModule {}
