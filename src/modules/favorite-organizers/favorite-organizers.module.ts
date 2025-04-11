import { Module } from '@nestjs/common';
import { FavoriteOrganizersService } from './favorite-organizers.service';
import { FavoriteOrganizersController } from './favorite-organizers.controller';
import { FavoriteOrganizersRepository } from './favorite-organizers.repository';
import { PrismaService } from '../app/prisma.service';
import { OrganizersModule } from '../organizers/organizers.module';

@Module({
  imports: [OrganizersModule],
  controllers: [FavoriteOrganizersController],
  providers: [
    FavoriteOrganizersService,
    FavoriteOrganizersRepository,
    PrismaService,
  ],
})
export class FavoriteOrganizersModule {}
