import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { FriendsRepository } from './friends.repository';
import { PrismaService } from '../app/prisma.service';
import { UsersModule } from '../users/users.module';
@Module({
  imports: [UsersModule],
  controllers: [FriendsController],
  providers: [FriendsService, FriendsRepository, PrismaService],
})
export class FriendsModule {}
