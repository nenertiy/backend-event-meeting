import { Injectable } from '@nestjs/common';
import { PrismaService } from '../app/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { EVENT_SELECT } from 'src/common/types/include/event';
import { UpdateEventDto } from './dto/update-event.dto';
import { ParticipationStatus } from '@prisma/client';

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

    return this.prisma.event.create({
      data: {
        ...eventData,
        eventTag: data.tagIds?.length
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
      where: query
        ? {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {},
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
}
