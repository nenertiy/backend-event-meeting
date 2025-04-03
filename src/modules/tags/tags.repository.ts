import { Injectable } from '@nestjs/common';
import { PrismaService } from '../app/prisma.service';

@Injectable()
export class TagsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: string, take?: number, skip?: number) {
    return this.prisma.tag.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
      take,
      skip,
    });
  }

  async findById(id: string) {
    return this.prisma.tag.findUnique({ where: { id } });
  }

  async findByName(name: string) {
    return this.prisma.tag.findUnique({ where: { name } });
  }

  async create(data: { name: string }) {
    return this.prisma.tag.create({ data });
  }

  async update(id: string, data: { name: string }) {
    return this.prisma.tag.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.tag.delete({ where: { id } });
  }
}
