import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../app/prisma.service';
import { CreateMediaDto } from './dto/create-media.dto';

@Injectable()
export class MediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMediaDto) {
    return this.prisma.media.create({
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.media.delete({
      where: { id },
    });
  }

  async findOne(id: string) {
    return this.prisma.media.findFirst({
      where: { id },
    });
  }

  async existById(id: string) {
    const media = await this.prisma.media.findUnique({
      where: { id },
    });

    return !!media;
  }

  async uploadUserAvatar(userId: string, mediaId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarId: mediaId },
    });
  }

  async findUserAvatar(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { avatar: true },
    });
  }

  async uploadEventCoverImage(eventId: string, mediaId: string) {
    return this.prisma.event.update({
      where: { id: eventId },
      data: { coverImageId: mediaId },
    });
  }

  async findEventCoverImage(eventId: string) {
    return this.prisma.event.findUnique({
      where: { id: eventId },
      include: { coverImage: true },
    });
  }

  async uploadEventImages(eventId: string, mediaIds: string[]) {
    return this.prisma.eventImage.createMany({
      data: mediaIds.map((id) => ({ eventId, imageId: id })),
    });
  }

  async findEventImages(eventId: string) {
    return this.prisma.eventImage.findMany({
      where: { eventId },
      include: { image: true },
    });
  }

  async findUsersWithAvatar(mediaId: string) {
    return this.prisma.user.findMany({
      where: { avatarId: mediaId },
    });
  }

  async removeAvatarFromUsers(mediaId: string) {
    return this.prisma.user.updateMany({
      where: { avatarId: mediaId },
      data: { avatarId: null },
    });
  }

  async findEventsWithCoverImage(mediaId: string) {
    return this.prisma.event.findMany({
      where: { coverImageId: mediaId },
    });
  }

  async removeCoverImageFromEvents(mediaId: string) {
    return this.prisma.event.updateMany({
      where: { coverImageId: mediaId },
      data: { coverImageId: null },
    });
  }

  async removeEventImages(mediaId: string) {
    return this.prisma.eventImage.deleteMany({
      where: { imageId: mediaId },
    });
  }
}
