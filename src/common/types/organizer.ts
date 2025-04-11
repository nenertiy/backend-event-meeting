import { Prisma } from '@prisma/client';
import {
  ORGANIZER_SELECT,
  ORGANIZER_WITH_EVENTS_SELECT,
} from './include/organizer';

export type Organizer = Prisma.OrganizerGetPayload<{
  include: typeof ORGANIZER_WITH_EVENTS_SELECT;
}>;

export type OrganizerWithoutEvents = Prisma.OrganizerGetPayload<{
  include: typeof ORGANIZER_SELECT;
}>;
