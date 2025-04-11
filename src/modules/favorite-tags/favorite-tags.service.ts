import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { FavoriteTagsRepository } from './favorite-tags.repository';
import { TagsService } from '../tags/tags.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
@Injectable()
export class FavoriteTagsService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly favoriteTagsRepository: FavoriteTagsRepository,
    private readonly tagsService: TagsService,
  ) {}

  async addFavoriteTag(userId: string, tagId: string) {
    const tag = await this.tagsService.findById(tagId);
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    const userFavoriteTag =
      await this.favoriteTagsRepository.getUserFavoriteTag(userId, tagId);
    if (userFavoriteTag) {
      throw new BadRequestException('Tag already in favorites');
    }
    const favoriteTag = await this.favoriteTagsRepository.addFavoriteTag(
      userId,
      tagId,
    );

    await this.cacheManager.del(`user_${userId}`);

    return {
      message: 'Tag added to favorites',
      favoriteTag,
    };
  }

  async removeFavoriteTag(userId: string, tagId: string) {
    const tag = await this.tagsService.findById(tagId);
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    const userFavoriteTag =
      await this.favoriteTagsRepository.getUserFavoriteTag(userId, tagId);
    if (!userFavoriteTag) {
      throw new BadRequestException('Tag not in favorites');
    }
    const favoriteTag = await this.favoriteTagsRepository.removeFavoriteTag(
      userId,
      tagId,
    );

    await this.cacheManager.del(`user_${userId}`);

    return {
      message: 'Tag removed from favorites',
      favoriteTag,
    };
  }

  async getFavoriteTags(userId: string) {
    const favoriteTags =
      await this.favoriteTagsRepository.getFavoriteTags(userId);
    if (favoriteTags.length === 0) {
      throw new NotFoundException('No favorite tags found');
    }
    return favoriteTags;
  }
}
