import { Injectable } from '@nestjs/common';
import { PrismaService } from '../app/prisma.service';

@Injectable()
export class FavoriteOrganizersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async addFavoriteOrganizer(userId: string, organizerId: string) {
    return this.prisma.favoriteOrganizer.create({
      data: { userId, organizerId },
    });
  }

  async removeFavoriteOrganizer(userId: string, organizerId: string) {
    return this.prisma.favoriteOrganizer.delete({
      where: { userId_organizerId: { userId, organizerId } },
    });
  }

  async getUserFavoriteOrganizers(userId: string) {
    return this.prisma.favoriteOrganizer.findMany({
      where: { userId },
      include: {
        organizer: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                avatar: {
                  select: { id: true, url: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async getUserFavoriteOrganizer(userId: string, organizerId: string) {
    return this.prisma.favoriteOrganizer.findUnique({
      where: { userId_organizerId: { userId, organizerId } },
    });
  }
}
