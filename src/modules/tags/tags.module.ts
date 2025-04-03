import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { TagsRepository } from './tags.repository';
import { PrismaService } from '../app/prisma.service';

@Module({
  controllers: [TagsController],
  providers: [TagsService, TagsRepository, PrismaService],
})
export class TagsModule {}
