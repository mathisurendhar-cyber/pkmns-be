import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUsersModule } from './admin-users/admin-users.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { CommonModule } from './common/common.module';
import { ContactModule } from './contact/contact.module';
import { AdminUser } from './entities/admin-user.entity';
import { Category } from './entities/category.entity';
import { Event } from './entities/event.entity';
import { Gallery } from './entities/gallery.entity';
import { Member } from './entities/member.entity';
import { MembershipApplication } from './entities/membership-application.entity';
import { News } from './entities/news.entity';
import { OfficeBearer } from './entities/office-bearer.entity';
import { ServiceContact } from './entities/service-contact.entity';
import { UploadAsset } from './entities/upload-asset.entity';
import { Visitor } from './entities/visitor.entity';
import { EventsModule } from './events/events.module';
import { MembersModule } from './members/members.module';
import { MembershipModule } from './membership/membership.module';
import { NewsModule } from './news/news.module';
import { OfficeBearersModule } from './office-bearers/office-bearers.module';
import { VisitorsModule } from './visitors/visitors.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        const entities = [
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
          UploadAsset,
        ];

        if (databaseUrl) {
          return {
            type: 'postgres' as const,
            url: databaseUrl,
            ssl: { rejectUnauthorized: false },
            entities,
            synchronize: true,
          };
        }

        return {
          type: 'postgres' as const,
          host: config.get<string>('DB_HOST') || 'localhost',
          port: parseInt(config.get<string>('DB_PORT') || '5432', 10),
          username: config.get<string>('DB_USERNAME') || 'postgres',
          password: config.get<string>('DB_PASSWORD') || 'root',
          database: config.get<string>('DB_DATABASE') || 'pkmns',
          entities,
          synchronize: true,
        };
      },
    }),
    CommonModule,
    AuthModule,
    AdminUsersModule,
    MembersModule,
    EventsModule,
    NewsModule,
    OfficeBearersModule,
    CategoriesModule,
    MembershipModule,
    ContactModule,
    VisitorsModule,
  ],
})
export class AppModule {}
