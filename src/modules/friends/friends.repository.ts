import { Injectable } from '@nestjs/common';
import { PrismaService } from '../app/prisma.service';
import { FriendStatus } from '@prisma/client';

@Injectable()
export class FriendsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async sendFriendRequest(userId: string, friendId: string) {
    return this.prisma.friendship.create({
      data: { userId, friendId, status: FriendStatus.PENDING },
    });
  }

  async getToMeRequests(userId: string) {
    return this.prisma.friendship.findMany({
      where: {
        friendId: userId,
        status: FriendStatus.PENDING,
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        userId: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            organizer: true,
            avatar: {
              select: {
                url: true,
              },
            },
          },
        },
      },
    });
  }

  async getMyRequests(userId: string) {
    return this.prisma.friendship.findMany({
      where: {
        userId,
        status: FriendStatus.PENDING,
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        friendId: true,
        friend: {
          select: {
            id: true,
            username: true,
            email: true,
            organizer: true,
            avatar: {
              select: {
                url: true,
              },
            },
          },
        },
      },
    });
  }

  async acceptFriendRequest(id: string) {
    return this.prisma.friendship.update({
      where: {
        id,
        status: FriendStatus.PENDING,
      },
      data: {
        status: FriendStatus.ACCEPTED,
      },
    });
  }

  async rejectFriendRequest(id: string) {
    return this.prisma.friendship.update({
      where: {
        id,
        status: FriendStatus.PENDING,
      },
      data: {
        status: FriendStatus.REJECTED,
      },
    });
  }

  async cancelFriendRequest(id: string) {
    return this.prisma.friendship.delete({
      where: {
        id,
      },
    });
  }

  async deleteFriend(id: string) {
    return this.prisma.friendship.delete({
      where: {
        id,
        status: FriendStatus.ACCEPTED,
      },
    });
  }

  async getFriends(userId: string) {
    return await this.prisma.friendship.findMany({
      where: {
        status: FriendStatus.ACCEPTED,
        OR: [{ userId }, { friendId: userId }],
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            organizer: true,
            avatar: {
              select: {
                url: true,
              },
            },
          },
        },
        friend: {
          select: {
            id: true,
            username: true,
            email: true,
            organizer: true,
            avatar: {
              select: {
                url: true,
              },
            },
          },
        },
      },
    });
  }

  async getFriend(id: string) {
    return this.prisma.friendship.findFirst({
      where: {
        id,
      },
    });
  }

  async existsFriend(userId: string, friendId: string) {
    return this.prisma.friendship.findFirst({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });
  }
}
