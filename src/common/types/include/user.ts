import { Prisma } from '@prisma/client';

export const USER_SELECT = {
  id: true,
  username: true,
  email: true,
  role: true,
  avatar: true,
  organizer: {
    include: {
      events: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} as Prisma.UserSelect;
