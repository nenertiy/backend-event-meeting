import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { FriendsRepository } from './friends.repository';
import { UsersService } from '../users/users.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class FriendsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly friendsRepository: FriendsRepository,
    private readonly usersService: UsersService,
  ) {}

  async sendFriendRequest(userId: string, friendId: string) {
    if (userId === friendId) {
      throw new BadRequestException("You can't add yourself as a friend.");
    }

    const user = await this.usersService.findById(friendId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.friendsRepository.existsFriend(
      userId,
      friendId,
    );
    if (existing) {
      throw new BadRequestException('Friend request already exists');
    }

    await this.cacheManager.del(`user_${userId}`);
    await this.cacheManager.del(`user_${friendId}`);

    return this.friendsRepository.sendFriendRequest(userId, friendId);
  }

  async getFriendRequests(userId: string) {
    const [incoming, outgoing] = await Promise.all([
      this.friendsRepository.getToMeRequests(userId),
      this.friendsRepository.getMyRequests(userId),
    ]);

    if (incoming.length === 0 && outgoing.length === 0) {
      throw new NotFoundException('No friend requests');
    }

    return {
      incoming,
      outgoing,
    };
  }

  async getToMeRequests(userId: string) {
    const requests = await this.friendsRepository.getToMeRequests(userId);
    if (requests.length === 0) {
      throw new NotFoundException('No friend requests to you');
    }

    return requests;
  }

  async getMyRequests(userId: string) {
    const requests = await this.friendsRepository.getMyRequests(userId);
    if (requests.length === 0) {
      throw new NotFoundException('No friend requests from you');
    }

    return requests;
  }

  async acceptFriendRequest(id: string) {
    const request = await this.friendsRepository.getFriend(id);
    if (!request || request.status !== 'PENDING') {
      throw new BadRequestException('No pending friend request to accept');
    }

    await this.cacheManager.del(`user_${request.userId}`);
    await this.cacheManager.del(`user_${request.friendId}`);

    const friendship = await this.friendsRepository.acceptFriendRequest(id);
    return {
      message: 'Friend request accepted',
      friendship,
    };
  }

  async rejectFriendRequest(id: string) {
    const request = await this.friendsRepository.getFriend(id);
    if (!request || request.status !== 'PENDING') {
      throw new BadRequestException('No pending friend request to reject');
    }

    await this.cacheManager.del(`user_${request.userId}`);
    await this.cacheManager.del(`user_${request.friendId}`);

    const friendship = await this.friendsRepository.rejectFriendRequest(id);

    return {
      message: 'Friend request rejected',
      friendship,
    };
  }

  async cancelFriendRequest(id: string) {
    const request = await this.friendsRepository.getFriend(id);
    if (!request || request.status !== 'PENDING') {
      throw new BadRequestException('No pending friend request to cancel');
    }

    await this.cacheManager.del(`user_${request.userId}`);
    await this.cacheManager.del(`user_${request.friendId}`);

    const friendship = await this.friendsRepository.cancelFriendRequest(id);

    return {
      message: 'Friend request canceled',
      friendship,
    };
  }

  async deleteFriend(id: string) {
    const friendship = await this.friendsRepository.getFriend(id);
    if (!friendship || friendship.status !== 'ACCEPTED') {
      throw new BadRequestException('No accepted friendship to delete');
    }

    await this.cacheManager.del(`user_${friendship.userId}`);
    await this.cacheManager.del(`user_${friendship.friendId}`);

    await this.friendsRepository.deleteFriend(id);

    return {
      message: 'Friend deleted',
      friendship,
    };
  }

  async getFriends(userId: string) {
    const friendships = await this.friendsRepository.getFriends(userId);
    if (friendships.length === 0) {
      throw new NotFoundException('No friends');
    }

    return friendships.map((friendship) => {
      const { user, friend, ...rest } = friendship;
      return user.id === userId
        ? { ...rest, user: { ...friend } }
        : { ...rest, user: { ...user } };
    });
  }

  async getFriend(id: string) {
    const friendship = await this.friendsRepository.getFriend(id);
    if (!friendship) {
      throw new NotFoundException('Friend not found');
    }

    return friendship;
  }
}
