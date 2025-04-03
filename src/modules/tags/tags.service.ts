import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TagsRepository } from './tags.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class TagsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly tagsRepository: TagsRepository,
  ) {}

  async findAll(query?: string, take?: number, skip?: number) {
    const cachedTags = await this.cacheManager.get(
      `tags_${query}_${take}_${skip}`,
    );
    if (cachedTags) {
      return cachedTags;
    }
    const tags = await this.tagsRepository.findAll(query, take, skip);
    if (tags.length === 0) {
      throw new NotFoundException('No tags found');
    }
    await this.cacheManager.set(`tags_${query}_${take}_${skip}`, tags);
    return tags;
  }

  async findById(id: string) {
    const cachedTag = await this.cacheManager.get(`tag_${id}`);
    if (cachedTag) {
      return cachedTag;
    }
    const tag = await this.tagsRepository.findById(id);
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    await this.cacheManager.set(`tag_${id}`, tag);
    return tag;
  }

  async create(data: { name: string }) {
    const tag = await this.tagsRepository.findByName(data.name);
    if (tag) {
      throw new BadRequestException('Tag already exists');
    }
    await this.cacheManager.del(`tags`);
    return this.tagsRepository.create(data);
  }

  async update(id: string, data: { name: string }) {
    const tag = await this.tagsRepository.update(id, data);
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    await this.cacheManager.del(`tags`);
    await this.cacheManager.del(`tag_${id}`);
    await this.cacheManager.set(`tag_${id}`, tag);
    return tag;
  }

  async delete(id: string) {
    const tag = await this.tagsRepository.delete(id);
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    await this.cacheManager.del(`tags`);
    await this.cacheManager.del(`tag_${id}`);
    return tag;
  }
}
