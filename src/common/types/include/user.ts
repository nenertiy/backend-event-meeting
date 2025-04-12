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
  participant: {
    select: {
      id: true,
      visibility: true,
      eventParticipant: {
        select: {
          id: true,
          status: true,
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              endDate: true,
            },
          },
        },
      },
    },
  },
  favoriteTags: {
    select: {
      tag: { select: { id: true, name: true } },
    },
  },
  favoriteOrganizer: {
    select: {
      organizer: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              avatar: { select: { id: true, url: true } },
            },
          },
        },
      },
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

export const USERS_SELECT = {
  id: true,
  username: true,
  email: true,
  role: true,
  avatar: { select: { id: true, url: true } },
  organizer: true,
  createdAt: true,
  updatedAt: true,
} as Prisma.UserSelect;
