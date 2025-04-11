import { Module } from '@nestjs/common';
import { FavoriteTagsService } from './favorite-tags.service';
import { FavoriteTagsController } from './favorite-tags.controller';
import { TagsModule } from '../tags/tags.module';
import { FavoriteTagsRepository } from './favorite-tags.repository';
import { PrismaService } from '../app/prisma.service';

@Module({
  imports: [TagsModule],
  controllers: [FavoriteTagsController],
  providers: [FavoriteTagsService, FavoriteTagsRepository, PrismaService],
})
export class FavoriteTagsModule {}
