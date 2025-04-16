import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { MediaRepository } from './media.repository';
import { InjectS3, S3 } from 'nestjs-s3';
import { ConfigService } from '@nestjs/config';
import { MediaType } from '@prisma/client';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService implements OnModuleInit {
  private bucketName: string;
  constructor(
    @InjectS3() private readonly s3: S3,
    private readonly mediaRepository: MediaRepository,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.bucketName = this.configService.get('S3_BUCKET_NAME');
  }

  async uploadFile(file: Express.Multer.File, type: MediaType) {
    const key = `${type}-${uuidv4()}-${file.originalname}`;
    try {
      const upload = await this.s3.putObject({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
      });

      const media = await this.mediaRepository.create({
        url: key,
        type,
        filename: file.originalname,
      });

      return media;
    } catch (error) {
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }

  async findOneByKey(key: string): Promise<Readable> {
    try {
      const media = await this.s3.getObject({
        Bucket: this.bucketName,
        Key: key,
      });
      return media.Body as Readable;
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async deleteObject(key: string) {
    try {
      await this.s3.deleteObject({
        Bucket: this.bucketName,
        Key: key,
      });
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async delete(id: string) {
    const media = await this.mediaRepository.findOne(id);
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Перед удалением, проверим и удалим связи с пользователями
    const usersWithAvatar = await this.mediaRepository.findUsersWithAvatar(id);

    // Обновим пользователей, убрав ссылку на аватар
    if (usersWithAvatar.length > 0) {
      await this.mediaRepository.removeAvatarFromUsers(id);
    }

    // Проверим и удалим связи с событиями (coverImage)
    const eventsWithCover =
      await this.mediaRepository.findEventsWithCoverImage(id);

    if (eventsWithCover.length > 0) {
      await this.mediaRepository.removeCoverImageFromEvents(id);
    }

    // Проверим и удалим связи в EventImage
    await this.mediaRepository.removeEventImages(id);

    // Теперь удаляем само медиа
    await this.mediaRepository.delete(id);

    // Также удаляем файл из S3
    await this.deleteObject(media.url);
  }

  async findOneById(id: string) {
    const media = await this.mediaRepository.findOne(id);
    if (!media) {
      throw new NotFoundException('Media not found');
    }
    return media;
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.mediaRepository.findUserAvatar(userId);

    const upload = await this.uploadFile(file, MediaType.AVATAR);

    await this.mediaRepository.uploadUserAvatar(userId, upload.id);

    if (user.avatarId) {
      try {
        await this.mediaRepository.delete(user.avatarId);
        if (user.avatar?.url) {
          await this.deleteObject(user.avatar?.url);
        }
      } catch (error) {
        console.error('Failed to delete old avatar:', error);
      }
    }

    return upload;
  }

  async deleteAvatar(userId: string) {
    const user = await this.mediaRepository.findUserAvatar(userId);
    if (!user.avatar) {
      throw new NotFoundException('User does not have an avatar');
    }
    await this.delete(user.avatarId);
    await this.deleteObject(user.avatar.url);
  }

  async uploadEventCoverImage(eventId: string, file: Express.Multer.File) {
    const upload = await this.uploadFile(file, MediaType.COVER_IMAGE);
    await this.mediaRepository.uploadEventCoverImage(eventId, upload.id);
    return upload;
  }

  async deleteEventCoverImage(eventId: string) {
    const event = await this.mediaRepository.findEventCoverImage(eventId);
    if (!event.coverImage) {
      throw new NotFoundException('Event does not have a cover image');
    }
    await this.delete(event.coverImageId);
    await this.deleteObject(event.coverImage.url);
  }

  async uploadEventImages(eventId: string, files: Express.Multer.File[]) {
    const uploads = await Promise.all(
      files.map((file) => this.uploadFile(file, MediaType.EVENT_IMAGE)),
    );
    await this.mediaRepository.uploadEventImages(
      eventId,
      uploads.map((upload) => upload.id),
    );
    return uploads;
  }

  async deleteEventImages(eventId: string) {
    const images = await this.mediaRepository.findEventImages(eventId);
    if (images.length === 0) {
      throw new NotFoundException('Event does not have any images');
    }

    await Promise.all(images.map((img) => this.delete(img.image.id)));
    await Promise.all(images.map((img) => this.deleteObject(img.image.url)));
  }

  async replaceEventImages(eventId: string, files: Express.Multer.File[]) {
    const existingImages = await this.mediaRepository.findEventImages(eventId);

    if (existingImages.length) {
      await Promise.all(existingImages.map((img) => this.delete(img.image.id)));
      await Promise.all(
        existingImages.map((img) => this.deleteObject(img.image.url)),
      );
    }

    const uploads = await Promise.all(
      files.map((file) => this.uploadFile(file, MediaType.EVENT_IMAGE)),
    );

    await this.mediaRepository.uploadEventImages(
      eventId,
      uploads.map((upload) => upload.id),
    );

    return uploads;
  }
}
