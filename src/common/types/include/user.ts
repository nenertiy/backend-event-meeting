import { Prisma } from '@prisma/client';

export const USER_SELECT = {
  id: true,
  username: true,
  email: true,
  role: true,
  avatar: { select: { id: true, url: true } },
  organizer: {
    include: {
      events: true,
    },
  },
  favoriteTags: {
    select: {
      tag: { select: { id: true, name: true } },
    },
  },
  favoriteOrganizer: {
    select: {
      organizer: true,
    },
  },
  friendships: {
    include: {
      friend: {
        select: {
          id: true,
          username: true,
          avatar: { select: { id: true, url: true } },
        },
      },
      user: {
        select: {
          id: true,
          username: true,
          avatar: { select: { id: true, url: true } },
        },
      },
    },
  },
  createdAt: true,
  updatedAt: true,
} as Prisma.UserSelect;
