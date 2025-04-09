import { Injectable } from '@nestjs/common';
import { PrismaService } from '../app/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { EVENT_SELECT } from 'src/common/types/include/event';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventStatus, ParticipationStatus, Prisma } from '@prisma/client';
import { SearchEventDto } from './dto/search-event.dto';

@Injectable()
export class EventsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizerId: string, data: CreateEventDto) {
    const existingTags = await this.prisma.tag.findMany({
      where: { id: { in: data.tagIds } },
      select: { id: true },
    });

    const validTagIds = existingTags.map((tag) => tag.id);
    const { tagIds, ...eventData } = data;

    const status = await this.determineEventStatus(
      new Date(eventData.startDate),
      new Date(eventData.endDate),
    );

    return this.prisma.event.create({
      data: {
        ...eventData,
        status,
        eventTag: tagIds?.length
          ? { create: validTagIds.map((tagId) => ({ tagId })) }
          : undefined,
        organizer: {
          connect: { id: organizerId },
        },
      },
    });
  }

  async update(id: string, data: UpdateEventDto) {
    const existingEvent = await this.prisma.event.findUnique({
      where: { id },
    });

    const existingTags = await this.prisma.tag.findMany({
      where: { id: { in: data.tagIds } },
      select: { id: true },
    });

    const validTagIds = existingTags.map((tag) => tag.id);

    const updatedData = {
      ...existingEvent,
      ...data,
    };

    const { tagIds, ...eventData } = updatedData;

    return this.prisma.event.update({
      where: { id },
      data: {
        ...eventData,
        eventTag: data.tagIds?.length
          ? { create: validTagIds.map((tagId) => ({ tagId })) }
          : undefined,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.event.delete({
      where: { id },
    });
  }

  async findAll(query?: string, take?: number, skip?: number) {
    return this.prisma.event.findMany({
      take,
      skip,
      where: {
        status: { not: EventStatus.CANCELLED },
        ...(query && {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        }),
      },
      select: EVENT_SELECT,
    });
  }

  async search(dto: SearchEventDto) {
    return this.prisma.event.findMany({
      where: this.getWhere(dto),
      select: EVENT_SELECT,
    });
  }

  async findById(id: string) {
    return this.prisma.event.findUnique({
      where: { id },
      select: EVENT_SELECT,
    });
  }

  async findByOrganizerId(organizerId: string) {
    return this.prisma.event.findMany({
      where: { organizerId },
      select: EVENT_SELECT,
    });
  }

  async findByTagId(tagId: string) {
    return this.prisma.event.findMany({
      where: { eventTag: { some: { tagId } } },
      select: EVENT_SELECT,
    });
  }

  async cancelEvent(id: string) {
    return this.prisma.event.update({
      where: { id },
      data: { status: EventStatus.CANCELLED },
    });
  }

  async joinEvent(eventId: string, participantId: string) {
    return this.prisma.eventParticipant.create({
      data: { eventId, participantId, status: ParticipationStatus.GOING },
    });
  }

  async leaveEvent(eventId: string, participantId: string) {
    return this.prisma.eventParticipant.delete({
      where: { eventId_participantId: { eventId, participantId } },
    });
  }

  async getParticipants(eventId: string) {
    return this.prisma.eventParticipant.findMany({
      where: { eventId },
      select: {
        participant: {
          select: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                avatar: {
                  select: {
                    url: true,
                    filename: true,
                    type: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async determineEventStatus(
    startDate: Date,
    endDate: Date,
    currentStatus?: EventStatus,
  ): Promise<EventStatus> {
    if (currentStatus === EventStatus.CANCELLED) return EventStatus.CANCELLED;

    const now = new Date();

    if (now < startDate) return EventStatus.SCHEDULED;
    if (now >= startDate && now <= endDate) return EventStatus.ONGOING;
    return EventStatus.COMPLETED;
  }

  private getWhere(dto: SearchEventDto) {
    const { filters } = dto;
    const where: Prisma.EventWhereInput = {};

    if (filters?.query) {
      where.OR = [
        { title: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
        { address: { contains: filters.query, mode: 'insensitive' } },
        {
          organizer: {
            description: { contains: filters.query, mode: 'insensitive' },
          },
        },
      ];
    }

    if (filters?.tagIds?.length === 1) {
      where.eventTag = {
        some: {
          tag: {
            id: {
              in: filters.tagIds,
            },
          },
        },
      };
    }

    if (filters?.tagIds?.length > 1) {
      where.AND = filters.tagIds.map((tagId) => ({
        eventTag: {
          some: {
            tag: {
              id: tagId,
            },
          },
        },
      }));
    }

    return where;
  }
}
