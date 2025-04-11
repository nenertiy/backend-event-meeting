import { Controller, Post, Body, Delete, Get, UseGuards } from '@nestjs/common';
import { FavoriteOrganizersService } from './favorite-organizers.service';
import { ApiBody, ApiOperation, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DecodeUser } from 'src/common/decorators/decode-user.decorator';
import { UserWithoutPassword } from 'src/common/types/user';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Favorite Organizers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorite-organizers')
export class FavoriteOrganizersController {
  constructor(
    private readonly favoriteOrganizersService: FavoriteOrganizersService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Add a favorite organizer' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        organizerId: { type: 'string' },
      },
    },
  })
  async addFavoriteOrganizer(
    @DecodeUser() user: UserWithoutPassword,
    @Body() body: { organizerId: string },
  ) {
    return this.favoriteOrganizersService.addFavoriteOrganizer(
      user.id,
      body.organizerId,
    );
  }

  @Delete()
  @ApiOperation({ summary: 'Remove a favorite organizer' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        organizerId: { type: 'string' },
      },
    },
  })
  async removeFavoriteOrganizer(
    @DecodeUser() user: UserWithoutPassword,
    @Body() body: { organizerId: string },
  ) {
    return this.favoriteOrganizersService.removeFavoriteOrganizer(
      user.id,
      body.organizerId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all favorite organizers' })
  async getFavoriteOrganizers(@DecodeUser() user: UserWithoutPassword) {
    return this.favoriteOrganizersService.getUserFavoriteOrganizers(user.id);
  }
}
