import { Prisma } from '@prisma/client';

export const EVENT_SELECT = {
  id: true,
  title: true,
  description: true,
  format: true,
  status: true,
  startDate: true,
  endDate: true,
  duration: true,
  address: true,
  latitude: true,
  longitude: true,
  capacity: true,
  participantsCount: true,
  coverImage: {
    select: {
      id: true,
      url: true,
      filename: true,
      type: true,
    },
  },
  eventImage: {
    select: {
      image: {
        select: {
          id: true,
          url: true,
          filename: true,
          type: true,
        },
      },
    },
  },
  organizer: true,
  eventParticipant: true,
  eventTag: true,
  createdAt: true,
  updatedAt: true,
} as Prisma.EventSelect;
