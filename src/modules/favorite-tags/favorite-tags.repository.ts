import { Injectable } from '@nestjs/common';
import { PrismaService } from '../app/prisma.service';

@Injectable()
export class FavoriteTagsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async addFavoriteTag(userId: string, tagId: string) {
    return this.prisma.favoriteTag.create({
      data: {
        userId,
        tagId,
      },
    });
  }

  async removeFavoriteTag(userId: string, tagId: string) {
    return this.prisma.favoriteTag.delete({
      where: {
        tagId_userId: { tagId, userId },
      },
    });
  }

  async getFavoriteTags(userId: string) {
    return this.prisma.favoriteTag.findMany({
      where: { userId },
      include: {
        tag: { select: { id: true, name: true } },
      },
    });
  }

  async getUserFavoriteTag(userId: string, tagId: string) {
    return this.prisma.favoriteTag.findUnique({
      where: { tagId_userId: { tagId, userId } },
    });
  }
}
