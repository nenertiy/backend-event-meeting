import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { OrganizersRepository } from './organizers.repositiory';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Organizer } from 'src/common/types/organizer';
@Injectable()
export class OrganizersService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly organizersRepository: OrganizersRepository,
  ) {}

  async findById(id: string) {
    const cachedOrganizer = await this.cacheManager.get<Organizer>(
      `organizer_${id}`,
    );
    if (cachedOrganizer) {
      return cachedOrganizer;
    }
    const organizer = await this.organizersRepository.findById(id);
    if (!organizer) {
      throw new NotFoundException('Organizer not found');
    }
    await this.cacheManager.set<Organizer>(`organizer_${id}`, organizer);

    return organizer;
  }

  async findAll() {
    const cachedOrganizers =
      await this.cacheManager.get<Organizer[]>(`organizers`);
    if (cachedOrganizers) {
      return cachedOrganizers;
    }
    const organizers = await this.organizersRepository.findAll();
    if (organizers.length === 0) {
      throw new NotFoundException('Organizers not found');
    }
    await this.cacheManager.set<Organizer[]>(`organizers`, organizers);

    return organizers;
  }

  async accreditOrganizer(id: string) {
    const organizer = await this.organizersRepository.findById(id);
    if (!organizer) {
      throw new NotFoundException('Organizer not found');
    }
    await this.cacheManager.del(`organizers`);
    await this.cacheManager.del(`organizer_${id}`);
    return this.organizersRepository.accreditOrganizer(id);
  }
}
