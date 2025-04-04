import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventsRepository } from './events.repository';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { MediaService } from '../media/media.service';
import { UsersService } from '../users/users.service';
import { ParticipantsService } from '../participants/participants.service';
@Injectable()
export class EventsService {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly mediaService: MediaService,
    private readonly participantsService: ParticipantsService,
  ) {}

  async create(
    organizerId: string,
    data: CreateEventDto,
    coverImage: Express.Multer.File,
    eventImages: Express.Multer.File[],
  ) {
    const createdEvent = await this.eventsRepository.create(organizerId, data);

    if (coverImage) {
      await this.mediaService.uploadEventCoverImage(
        createdEvent.id,
        coverImage,
      );
    }

    if (eventImages?.length > 0) {
      await this.mediaService.uploadEventImages(createdEvent.id, eventImages);
    }

    const event = await this.eventsRepository.findById(createdEvent.id);

    return event;
  }

  async update(
    id: string,
    data: UpdateEventDto,
    coverImage?: Express.Multer.File,
    eventImages?: Express.Multer.File[],
  ) {
    const event = await this.eventsRepository.findById(id);
    if (!event) throw new NotFoundException('Event not found');

    if (coverImage) {
      if (event.coverImageId) {
        await this.mediaService.deleteEventCoverImage(event.coverImageId);
      }
      await this.mediaService.uploadEventCoverImage(id, coverImage);
    }

    if (eventImages?.length) {
      await this.mediaService.replaceEventImages(id, eventImages);
    }

    await this.eventsRepository.update(id, data);

    return this.eventsRepository.findById(id);
  }

  async delete(id: string) {
    const event = await this.eventsRepository.findById(id);
    if (!event) throw new NotFoundException('Event not found');

    if (event.coverImageId) {
      await this.mediaService.deleteEventCoverImage(event.coverImageId);
    }
    await this.mediaService.deleteEventImages(id);

    return this.eventsRepository.delete(id);
  }

  async findAll(query?: string, take?: number, skip?: number) {
    const events = await this.eventsRepository.findAll(query, take, skip);
    if (events.length === 0) {
      throw new NotFoundException('No events found');
    }
    return events;
  }

  async findById(id: string) {
    const event = await this.eventsRepository.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async findByOrganizerId(organizerId: string) {
    const events = await this.eventsRepository.findByOrganizerId(organizerId);
    if (events.length === 0) {
      throw new NotFoundException('No events found');
    }
    return events;
  }

  async findByTagId(tagId: string) {
    const events = await this.eventsRepository.findByTagId(tagId);
    if (events.length === 0) {
      throw new NotFoundException('No events found');
    }
    return events;
  }

  async joinEvent(eventId: string, userId: string) {
    const event = await this.eventsRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    let participant = await this.participantsService.findByUserId(userId);
    if (!participant) {
      participant = await this.participantsService.create(userId);
    }

    const eventParticipant =
      await this.participantsService.findByEventIdAndParticipantId(
        eventId,
        participant.id,
      );
    if (eventParticipant) {
      throw new ConflictException(
        'You are already a participant of this event',
      );
    }

    await this.eventsRepository.joinEvent(eventId, participant.id);

    await this.eventsRepository.update(eventId, {
      participantsCount: event.participantsCount + 1,
    });

    return {
      message: 'You have joined the event',
    };
  }

  async leaveEvent(eventId: string, userId: string) {
    const event = await this.eventsRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const participant = await this.participantsService.findByUserId(userId);
    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    const eventParticipant =
      await this.participantsService.findByEventIdAndParticipantId(
        eventId,
        participant.id,
      );
    if (!eventParticipant) {
      throw new NotFoundException('You are not a participant of this event');
    }

    await this.eventsRepository.leaveEvent(eventId, participant.id);

    await this.eventsRepository.update(eventId, {
      participantsCount: event.participantsCount - 1,
    });

    return {
      message: 'You have left the event',
    };
  }

  async getParticipants(eventId: string) {
    const participants = await this.eventsRepository.getParticipants(eventId);
    if (participants.length === 0) {
      throw new NotFoundException('No participants found');
    }
    return participants;
  }
}
