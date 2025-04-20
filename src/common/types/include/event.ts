import { Prisma } from '@prisma/client';

export const EVENT_SELECT = {
  id: true,
  title: true,
  description: true,
  infoResource: true,
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
  organizer: {
    select: {
      id: true,
      description: true,
      sphereOfActivity: true,
      isAccredited: true,
      phone: true,
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          avatar: {
            select: {
              id: true,
              url: true,
              filename: true,
              type: true,
            },
          },
        },
      },
    },
  },
  eventParticipant: {
    select: {
      id: true,
      status: true,
      participant: {
        select: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              avatar: {
                select: {
                  url: true,
                  filename: true,
                  type: true,
                },
              },
            },
          },
        },
      },
    },
  },
  eventTag: {
    select: {
      tag: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  createdAt: true,
  updatedAt: true,
} as Prisma.EventSelect;
