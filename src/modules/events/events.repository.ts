import { Injectable } from '@nestjs/common';
import { PrismaService } from '../app/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { EVENT_SELECT } from 'src/common/types/include/event';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizerId: string, data: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        ...data,
        organizer: {
          connect: {
            id: organizerId,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateEventDto) {
    const existingEvent = await this.prisma.event.findUnique({
      where: { id },
    });

    const updatedData = {
      ...existingEvent,
      ...data,
    };

    return this.prisma.event.update({
      where: { id },
      data: updatedData,
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
}
