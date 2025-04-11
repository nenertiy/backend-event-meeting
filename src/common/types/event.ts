import { Prisma } from '@prisma/client';
import { EVENT_SELECT } from './include/event';

export type Event = Prisma.EventGetPayload<{
  include: typeof EVENT_SELECT;
}>;
