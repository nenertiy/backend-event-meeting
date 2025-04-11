import { Controller, Post, Body, Delete, Get, UseGuards } from '@nestjs/common';
import { FavoriteTagsService } from './favorite-tags.service';
import { DecodeUser } from 'src/common/decorators/decode-user.decorator';
import { UserWithoutPassword } from 'src/common/types/user';
import { ApiOperation, ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Favorite Tags')
@Controller('favorite-tags')
export class FavoriteTagsController {
  constructor(private readonly favoriteTagsService: FavoriteTagsService) {}

  @ApiOperation({ summary: 'Add a favorite tag' })
  @ApiBody({
    schema: { type: 'object', properties: { tagId: { type: 'string' } } },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async addFavoriteTag(
    @DecodeUser() user: UserWithoutPassword,
    @Body() body: { tagId: string },
  ) {
    return this.favoriteTagsService.addFavoriteTag(user.id, body.tagId);
  }

  @ApiOperation({ summary: 'Remove a favorite tag' })
  @ApiBody({
    schema: { type: 'object', properties: { tagId: { type: 'string' } } },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete()
  async removeFavoriteTag(
    @DecodeUser() user: UserWithoutPassword,
    @Body() body: { tagId: string },
  ) {
    return this.favoriteTagsService.removeFavoriteTag(user.id, body.tagId);
  }

  @ApiOperation({ summary: 'Get all favorite tags' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async getFavoriteTags(@DecodeUser() user: UserWithoutPassword) {
    return this.favoriteTagsService.getFavoriteTags(user.id);
  }
}
