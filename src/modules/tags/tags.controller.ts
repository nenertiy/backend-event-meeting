import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Body,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @ApiOperation({ summary: 'Get all tags' })
  @ApiQuery({ name: 'query', type: String, required: false })
  @ApiQuery({ name: 'take', type: Number, required: false })
  @ApiQuery({ name: 'skip', type: Number, required: false })
  @Get()
  async findAll(
    @Query('query') query?: string,
    @Query('take') take?: number,
    @Query('skip') skip?: number,
  ) {
    return this.tagsService.findAll(query, take, skip);
  }

  @ApiOperation({ summary: 'Get tag by id' })
  @ApiParam({ name: 'id', type: String })
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.tagsService.findById(id);
  }

  @ApiOperation({ summary: 'Create tag (Admin and Organizer only)' })
  @ApiBody({
    schema: { type: 'object', properties: { name: { type: 'string' } } },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @Post()
  async create(@Body() data: { name: string }) {
    return this.tagsService.create(data);
  }

  @ApiOperation({ summary: 'Update tag (Admin and Organizer only)' })
  @ApiBody({
    schema: { type: 'object', properties: { name: { type: 'string' } } },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @Put(':id')
  async update(@Param('id') id: string, @Body() data: { name: string }) {
    return this.tagsService.update(id, data);
  }

  @ApiOperation({ summary: 'Delete tag (Admin and Organizer only)' })
  @ApiParam({ name: 'id', type: String })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.tagsService.delete(id);
  }
}
