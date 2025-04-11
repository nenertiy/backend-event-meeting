import { Injectable } from '@nestjs/common';
import { PrismaService } from '../app/prisma.service';
import {
  ORGANIZER_SELECT,
  ORGANIZER_WITH_EVENTS_SELECT,
} from 'src/common/types/include/organizer';

@Injectable()
export class OrganizersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.organizer.findUnique({
      where: { id },
      select: ORGANIZER_WITH_EVENTS_SELECT,
    });
  }

  async findAll() {
    return this.prisma.organizer.findMany({
      select: ORGANIZER_SELECT,
    });
  }

  async accreditOrganizer(id: string) {
    return this.prisma.organizer.update({
      where: { id },
      data: { isAccredited: true },
    });
  }
}
