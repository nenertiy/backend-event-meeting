import { Module } from '@nestjs/common';
import { OrganizersService } from './organizers.service';
import { OrganizersController } from './organizers.controller';
import { OrganizersRepository } from './organizers.repositiory';
import { PrismaService } from '../app/prisma.service';

@Module({
  exports: [OrganizersService],
  controllers: [OrganizersController],
  providers: [OrganizersService, OrganizersRepository, PrismaService],
})
export class OrganizersModule {}
