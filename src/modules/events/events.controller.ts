import {
  Controller,
  Post,
  UseInterceptors,
  Body,
  UploadedFiles,
  UseGuards,
  Patch,
  Param,
  Delete,
  Get,
  Query,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { CreateEventDto } from './dto/create-event.dto';
import { UserWithoutPassword } from 'src/common/types/user';
import { DecodeUser } from 'src/common/decorators/decode-user.decorator';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole, EventFormat, EventStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateEventDto } from './dto/update-event.dto';
import { CanEventGuard } from '../auth/guards/event.guard';
import { SearchEventDto } from './dto/search-event.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @ApiOperation({ summary: 'Create event' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        startDate: {
          type: 'string',
          format: 'date',
        },
        endDate: {
          type: 'string',
          format: 'date',
        },
        registrationDeadline: {
          type: 'string',
          format: 'date',
        },
        duration: {
          type: 'number',
        },
        address: {
          type: 'string',
        },
        latitude: {
          type: 'number',
        },
        longitude: {
          type: 'number',
        },
        capacity: {
          type: 'number',
        },
        participantsCount: {
          type: 'number',
        },
        format: {
          type: 'string',
          enum: Object.values(EventFormat),
        },
        coverImage: {
          type: 'string',
          format: 'binary',
        },
        eventImages: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        tagIds: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
        },
      },
    },
  })
  @ApiBearerAuth()
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @UseInterceptors(AnyFilesInterceptor())
  async create(
    @DecodeUser() user: UserWithoutPassword,
    @Body() data: CreateEventDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const coverImage = files.find((file) => file.fieldname === 'coverImage');
    const eventImages = files.filter(
      (file) => file.fieldname === 'eventImages',
    );

    return this.eventsService.create(
      user.organizer.id,
      data,
      coverImage,
      eventImages,
    );
  }

  @ApiOperation({ summary: 'Get all events' })
  @ApiQuery({ name: 'query', type: String, required: false })
  @ApiQuery({ name: 'take', type: Number, required: false })
  @ApiQuery({ name: 'skip', type: Number, required: false })
  @Get()
  async findAll(
    @Query('query') query: string,
    @Query('take') take: number,
    @Query('skip') skip: number,
  ) {
    return this.eventsService.findAll(query, take, skip);
  }

  @ApiOperation({ summary: 'Get event by id' })
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.eventsService.findById(id);
  }

  @ApiOperation({ summary: 'Update event' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        startDate: {
          type: 'string',
          format: 'date',
        },
        endDate: {
          type: 'string',
          format: 'date',
        },
        duration: {
          type: 'number',
        },
        address: {
          type: 'string',
        },
        latitude: {
          type: 'number',
        },
        longitude: {
          type: 'number',
        },
        capacity: {
          type: 'number',
        },
        participantsCount: {
          type: 'number',
        },
        format: {
          type: 'string',
          enum: Object.values(EventFormat),
        },
        status: {
          type: 'string',
          enum: Object.values(EventStatus),
        },
        coverImage: {
          type: 'string',
          format: 'binary',
        },
        eventImages: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, CanEventGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @UseInterceptors(AnyFilesInterceptor())
  async update(
    @Param('id') id: string,
    @Body() data: UpdateEventDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const coverImage = files.find((file) => file.fieldname === 'coverImage');
    const eventImages = files.filter(
      (file) => file.fieldname === 'eventImages',
    );

    return this.eventsService.update(id, data, coverImage, eventImages);
  }

  @ApiOperation({ summary: 'Delete event' })
  @ApiBearerAuth()
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, CanEventGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    return this.eventsService.delete(id);
  }

  @ApiOperation({ summary: 'Search events' })
  @Post('search')
  async search(@Body() dto: SearchEventDto) {
    return this.eventsService.search(dto);
  }

  @ApiOperation({ summary: 'Get all events by organizer id' })
  @Get('organizer/:id')
  async findByOrganizerId(@Param('id') id: string) {
    return this.eventsService.findByOrganizerId(id);
  }

  @ApiOperation({ summary: 'Get all events by tag id' })
  @Get('tag/:id')
  async findByTagId(@Param('id') id: string) {
    return this.eventsService.findByTagId(id);
  }

  @ApiOperation({ summary: 'Cancel event' })
  @ApiBearerAuth()
  @Delete(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard, CanEventGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  async cancelEvent(@Param('id') id: string) {
    return this.eventsService.cancelEvent(id);
  }

  @ApiOperation({ summary: 'Join event' })
  @ApiBearerAuth()
  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  async joinEvent(
    @Param('id') id: string,
    @DecodeUser() user: UserWithoutPassword,
  ) {
    return this.eventsService.joinEvent(id, user.id);
  }

  @ApiOperation({ summary: 'Leave event' })
  @ApiBearerAuth()
  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  async leaveEvent(
    @Param('id') id: string,
    @DecodeUser() user: UserWithoutPassword,
  ) {
    return this.eventsService.leaveEvent(id, user.id);
  }

  @ApiOperation({ summary: 'Get participants of event' })
  @Get(':id/participants')
  async getParticipants(@Param('id') id: string) {
    return this.eventsService.getParticipants(id);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async updateEventsStatuses() {
    return this.eventsService.updateEventsStatuses();
  }
}
