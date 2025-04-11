import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { FavoriteOrganizersRepository } from './favorite-organizers.repository';
import { OrganizersService } from '../organizers/organizers.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class FavoriteOrganizersService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly favoriteOrganizersRepository: FavoriteOrganizersRepository,
    private readonly organizersService: OrganizersService,
  ) {}

  async addFavoriteOrganizer(userId: string, organizerId: string) {
    const userFavoriteOrganizer =
      await this.favoriteOrganizersRepository.getUserFavoriteOrganizer(
        userId,
        organizerId,
      );
    if (userFavoriteOrganizer) {
      throw new BadRequestException('Organizer already in favorites');
    }
    const organizer = await this.organizersService.findById(organizerId);
    if (!organizer) {
      throw new NotFoundException('Organizer not found');
    }
    const favoriteOrganizer =
      await this.favoriteOrganizersRepository.addFavoriteOrganizer(
        userId,
        organizerId,
      );

    await this.cacheManager.del(`user_${userId}`);

    return {
      message: 'Organizer added to favorites',
      favoriteOrganizer,
    };
  }

  async removeFavoriteOrganizer(userId: string, organizerId: string) {
    const userFavoriteOrganizer =
      await this.favoriteOrganizersRepository.getUserFavoriteOrganizer(
        userId,
        organizerId,
      );
    if (!userFavoriteOrganizer) {
      throw new BadRequestException('Organizer not in favorites');
    }
    const organizer = await this.organizersService.findById(organizerId);
    if (!organizer) {
      throw new NotFoundException('Organizer not found');
    }
    const favoriteOrganizer =
      await this.favoriteOrganizersRepository.removeFavoriteOrganizer(
        userId,
        organizerId,
      );

    await this.cacheManager.del(`user_${userId}`);
    return {
      message: 'Organizer removed from favorites',
      favoriteOrganizer,
    };
  }

  async getUserFavoriteOrganizers(userId: string) {
    const favoriteOrganizers =
      await this.favoriteOrganizersRepository.getUserFavoriteOrganizers(userId);
    if (favoriteOrganizers.length === 0) {
      throw new NotFoundException('No favorite organizers found');
    }
    return favoriteOrganizers;
  }
}
