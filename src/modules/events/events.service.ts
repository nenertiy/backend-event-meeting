import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventsRepository } from './events.repository';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { MediaService } from '../media/media.service';
import { ParticipantsService } from '../participants/participants.service';
import { OrganizersService } from '../organizers/organizers.service';
import { SearchEventDto } from './dto/search-event.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Event } from 'src/common/types/event';
import { Logger } from '@nestjs/common';
@Injectable()
export class EventsService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly eventsRepository: EventsRepository,
    private readonly mediaService: MediaService,
    private readonly participantsService: ParticipantsService,
    private readonly organizersService: OrganizersService,
  ) {}

  private readonly logger = new Logger(EventsService.name);

  async create(
    organizerId: string,
    data: CreateEventDto,
    coverImage: Express.Multer.File,
    eventImages: Express.Multer.File[],
  ) {
    const organizer = await this.organizersService.findById(organizerId);
    if (!organizer.isAccredited) {
      throw new ForbiddenException(
        'You are not allowed to create an event, you need to be accredited',
      );
    }

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
    this.logger.log(`Event ${event.id} created`);
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
    this.logger.log(`Event ${id} updated`);
    return this.eventsRepository.findById(id);
  }

  async delete(id: string) {
    const event = await this.eventsRepository.findById(id);
    if (!event) throw new NotFoundException('Event not found');

    if (event.coverImageId) {
      await this.mediaService.deleteEventCoverImage(id);
    }

    if (event.eventImage.length > 0) {
      await this.mediaService.deleteEventImages(id);
    }

    await this.eventsRepository.delete(id);
    this.logger.log(`Event ${id} deleted`);
    return {
      message: 'Event deleted successfully',
    };
  }

  async findAll(query?: string, take?: number, skip?: number) {
    const cachedEvents = await this.cacheManager.get<Event[]>(
      `events_${query}_${take}_${skip}`,
    );
    if (cachedEvents) {
      return cachedEvents;
    }
    const events = await this.eventsRepository.findAll(query, take, skip);
    if (events.length === 0) {
      throw new NotFoundException('No events found');
    }

    await this.cacheManager.set<Event[]>(
      `events_${query}_${take}_${skip}`,
      events,
    );

    return events;
  }

  async findById(id: string) {
    const cachedEvent = await this.cacheManager.get<Event>(`event_${id}`);
    if (cachedEvent) {
      return cachedEvent;
    }
    const event = await this.eventsRepository.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await this.cacheManager.set<Event>(`event_${id}`, event);

    return event;
  }

  async search(dto: SearchEventDto) {
    const cachedEvents = await this.cacheManager.get<Event[]>(
      `events_search_${JSON.stringify(dto)}`,
    );
    if (cachedEvents) {
      return cachedEvents;
    }
    const events = await this.eventsRepository.search(dto);
    if (events.length === 0) {
      throw new NotFoundException('No events found');
    }

    await this.cacheManager.set<Event[]>(
      `events_search_${JSON.stringify(dto)}`,
      events,
    );

    return events;
  }

  async findByOrganizerId(organizerId: string) {
    const cachedEvents = await this.cacheManager.get<Event[]>(
      `events_organizer_${organizerId}`,
    );
    if (cachedEvents) {
      return cachedEvents;
    }
    const events = await this.eventsRepository.findByOrganizerId(organizerId);
    if (events.length === 0) {
      throw new NotFoundException('No events found');
    }

    await this.cacheManager.set<Event[]>(
      `events_organizer_${organizerId}`,
      events,
    );

    return events;
  }

  async findByTagId(tagId: string) {
    const cachedEvents = await this.cacheManager.get<Event[]>(
      `events_tag_${tagId}`,
    );
    if (cachedEvents) {
      return cachedEvents;
    }
    const events = await this.eventsRepository.findByTagId(tagId);
    if (events.length === 0) {
      throw new NotFoundException('No events found');
    }

    await this.cacheManager.set<Event[]>(`events_tag_${tagId}`, events);

    return events;
  }

  async cancelEvent(id: string) {
    const event = await this.eventsRepository.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await this.cacheManager.del(`events`);
    await this.cacheManager.del(`event_${id}`);
    await this.cacheManager.del(`events_${event.organizerId}`);
    this.logger.log(`Event ${id} cancelled`);
    return this.eventsRepository.cancelEvent(id);
  }

  async joinEvent(eventId: string, userId: string) {
    const event = await this.eventsRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const now = new Date();
    const canRegister =
      (event.registrationDeadline && now <= event.registrationDeadline) ||
      (!event.registrationDeadline && now <= event.endDate);

    if (!canRegister) {
      throw new ForbiddenException('Registration on the event is closed');
    }

    if (event.capacity && event.participantsCount >= event.capacity) {
      throw new ForbiddenException('Event is full');
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
      throw new ConflictException('You are already registered on this event');
    }

    await this.eventsRepository.joinEvent(eventId, participant.id);
    await this.eventsRepository.update(eventId, {
      participantsCount: event.participantsCount + 1,
    });

    await this.cacheManager.del(`events`);
    await this.cacheManager.del(`event_${eventId}`);
    await this.cacheManager.del(`events_${event.organizerId}`);

    return { message: 'Successfully registered on the event' };
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

    await this.cacheManager.del(`events`);
    await this.cacheManager.del(`event_${eventId}`);
    await this.cacheManager.del(`events_${event.organizerId}`);

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

  async updateEventsStatuses() {
    const events = await this.eventsRepository.findAll();
    await this.syncStatuses(events);
    await this.cacheManager.del(`events`);
    await this.cacheManager.del(`events_*`);
    await this.cacheManager.del(`event_*`);
    this.logger.log('Events statuses updated');
  }

  private async syncStatuses(events: Event[]): Promise<Event[]> {
    for (const event of events) {
      const actualStatus = await this.eventsRepository.determineEventStatus(
        event.startDate,
        event.endDate,
      );
      if (event.status !== actualStatus) {
        await this.eventsRepository.update(event.id, { status: actualStatus });
        event.status = actualStatus;
      }
    }
    return events;
  }
}
