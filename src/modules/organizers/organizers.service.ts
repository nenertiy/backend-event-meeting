import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizersRepository } from './organizers.repositiory';

@Injectable()
export class OrganizersService {
  constructor(private readonly organizersRepository: OrganizersRepository) {}

  async findById(id: string) {
    const organizer = await this.organizersRepository.findById(id);
    if (!organizer) {
      throw new NotFoundException('Organizer not found');
    }
    return organizer;
  }

  async findAll() {
    const organizers = await this.organizersRepository.findAll();
    if (organizers.length === 0) {
      throw new NotFoundException('Organizers not found');
    }
    return organizers;
  }

  async accreditOrganizer(id: string) {
    const organizer = await this.organizersRepository.findById(id);
    if (!organizer) {
      throw new NotFoundException('Organizer not found');
    }
    return this.organizersRepository.accreditOrganizer(id);
  }
}
