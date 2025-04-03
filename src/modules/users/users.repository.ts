import { Injectable } from '@nestjs/common';
import { PrismaService } from '../app/prisma.service';
import { USER_SELECT } from 'src/common/types/include/user';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id }, select: USER_SELECT });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      select: USER_SELECT,
    });
  }

  async findAll(query?: string, take?: number, skip?: number) {
    return this.prisma.user.findMany({
      take,
      skip,
      where: { username: { contains: query, mode: 'insensitive' } },
      select: USER_SELECT,
    });
  }

  async createUser(data: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role,
      },
      select: USER_SELECT,
    });
  }

  async createOrganizer(data: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: data.password,
        role: UserRole.ORGANIZER,
        organizer: {
          create: {
            description: data.description,
            sphereOfActivity: data.sphereOfActivity,
            phone: data.phone,
            isAccredited: false,
          },
        },
      },
      select: USER_SELECT,
    });
  }

  async update(id: string, data: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: USER_SELECT,
    });
  }

  async delete(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
