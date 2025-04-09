import { Injectable } from '@nestjs/common';
import { PrismaService } from '../app/prisma.service';

@Injectable()
export class OrganizersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.organizer.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            avatar: {
              select: {
                id: true,
                url: true,
              },
            },
          },
        },
        events: true,
      },
    });
  }

  async findAll() {
    return this.prisma.organizer.findMany({
      include: {
        user: {
          include: {
            avatar: {
              select: {
                id: true,
                url: true,
              },
            },
          },
        },
      },
    });
  }

  async accreditOrganizer(id: string) {
    return this.prisma.organizer.update({
      where: { id },
      data: { isAccredited: true },
    });
  }
}
