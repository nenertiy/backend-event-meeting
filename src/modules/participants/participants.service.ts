import { Injectable, NotFoundException } from '@nestjs/common';
import { ParticipantsRepository } from './participants.repository';
import { Visibility } from '@prisma/client';

@Injectable()
export class ParticipantsService {
  constructor(
    private readonly participantsRepository: ParticipantsRepository,
  ) {}

  async create(userId: string) {
    return this.participantsRepository.create(userId);
  }

  async delete(id: string) {
    return this.participantsRepository.delete(id);
  }

  async changeVisibility(id: string, visibility: Visibility) {
    return this.participantsRepository.changeVisibility(id, visibility);
  }

  async findByUserId(userId: string) {
    const participant = await this.participantsRepository.findByUserId(userId);
    if (!participant || participant.eventParticipant.length === 0) {
      throw new NotFoundException('Participant not found');
    }
    return participant;
  }

  async findByEventIdAndParticipantId(eventId: string, participantId: string) {
    return this.participantsRepository.findByEventIdAndParticipantId(
      eventId,
      participantId,
    );
  }
}
