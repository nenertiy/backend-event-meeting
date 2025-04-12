import { Module } from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { ParticipantsRepository } from './participants.repository';
import { PrismaService } from '../app/prisma.service';
import { ParticipantsController } from './participants.controller';
@Module({
  providers: [ParticipantsService, ParticipantsRepository, PrismaService],
  controllers: [ParticipantsController],
  exports: [ParticipantsService],
})
export class ParticipantsModule {}
