import { Injectable } from '@nestjs/common';
import { ParticipantsRepository } from './participants.repository';

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

  async findByUserId(userId: string) {
    return this.participantsRepository.findByUserId(userId);
  }

  async findByEventIdAndParticipantId(eventId: string, participantId: string) {
    return this.participantsRepository.findByEventIdAndParticipantId(
      eventId,
      participantId,
    );
  }
}
