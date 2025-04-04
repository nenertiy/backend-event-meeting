import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsRepository } from './events.repository';
import { PrismaService } from '../app/prisma.service';
import { MediaModule } from '../media/media.module';
import { UsersModule } from '../users/users.module';
import { ParticipantsModule } from '../participants/participants.module';
@Module({
  imports: [MediaModule, UsersModule, ParticipantsModule],
  controllers: [EventsController],
  providers: [EventsService, EventsRepository, PrismaService],
})
export class EventsModule {}
