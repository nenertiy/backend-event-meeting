import { Module } from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { ParticipantsRepository } from './participants.repository';
import { PrismaService } from '../app/prisma.service';

@Module({
  providers: [ParticipantsService, ParticipantsRepository, PrismaService],
  exports: [ParticipantsService],
})
export class ParticipantsModule {}
