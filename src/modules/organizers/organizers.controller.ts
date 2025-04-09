import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { OrganizersService } from './organizers.service';
import { ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('organizers')
export class OrganizersController {
  constructor(private readonly organizersService: OrganizersService) {}

  @ApiOperation({ summary: 'Get all organizers' })
  @Get()
  async findAll() {
    return this.organizersService.findAll();
  }

  @ApiOperation({ summary: 'Get organizer by id' })
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.organizersService.findById(id);
  }

  @ApiOperation({ summary: 'Accredit organizer (Admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/accredit')
  async accreditOrganizer(@Param('id') id: string) {
    return this.organizersService.accreditOrganizer(id);
  }
}
