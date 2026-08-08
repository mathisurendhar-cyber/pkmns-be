import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { Event } from '../entities/event.entity';
import { Gallery } from '../entities/gallery.entity';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Gallery]), CommonModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
