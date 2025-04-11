import { Prisma } from '@prisma/client';

export const ORGANIZER_SELECT = {
  id: true,
  description: true,
  sphereOfActivity: true,
  infoResource: true,
  isAccredited: true,
  phone: true,
  email: true,
  address: true,
  latitude: true,
  longitude: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      username: true,
      email: true,
      avatar: {
        select: {
          id: true,
          url: true,
        },
      },
    },
  },
} as Prisma.OrganizerSelect;

export const ORGANIZER_WITH_EVENTS_SELECT = {
  ...ORGANIZER_SELECT,
  events: true,
} as Prisma.OrganizerSelect;
