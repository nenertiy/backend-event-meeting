import { Prisma } from '@prisma/client';
import { USER_SELECT } from './include/user';

export type User = Prisma.UserGetPayload<{
  include: typeof USER_SELECT;
}>;

export type UserWithoutPassword = Omit<User, 'password'>;
