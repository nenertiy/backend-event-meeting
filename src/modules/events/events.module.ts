import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsRepository } from './events.repository';
import { PrismaService } from '../app/prisma.service';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [MediaModule],
  controllers: [EventsController],
  providers: [EventsService, EventsRepository, PrismaService],
})
export class EventsModule {}
