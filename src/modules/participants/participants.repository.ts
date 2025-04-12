import { Injectable } from '@nestjs/common';
import { PrismaService } from '../app/prisma.service';
import { Visibility } from '@prisma/client';

@Injectable()
export class ParticipantsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string) {
    return this.prisma.participant.create({
      data: { userId, visibility: Visibility.PUBLIC },
      include: {
        eventParticipant: {
          include: {
            event: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.participant.delete({
      where: { id },
    });
  }

  async changeVisibility(id: string, visibility: Visibility) {
    return this.prisma.participant.update({
      where: { id },
      data: { visibility },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.participant.findUnique({
      where: { userId },
      include: {
        eventParticipant: {
          include: {
            event: true,
          },
        },
      },
    });
  }

  async findByEventIdAndParticipantId(eventId: string, participantId: string) {
    return this.prisma.eventParticipant.findUnique({
      where: { eventId_participantId: { eventId, participantId } },
    });
  }
}
