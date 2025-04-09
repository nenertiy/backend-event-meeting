import { PrismaClient, UserRole } from '@prisma/client';

export const seedUser = async (prisma: PrismaClient) => {
  await prisma.user.create({
    data: {
      email: 'admin@gmail.com',
      username: 'admin',
      password: '$2y$10$YfnOzpAkZWRW0D/ARgKtI.DreIGnp20ut2BS4bnmqOXsL18z0vjLi',
      role: UserRole.ADMIN,
    },
  });
};
