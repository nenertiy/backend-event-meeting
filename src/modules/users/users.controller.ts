import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  Body,
  UploadedFile,
  Post,
  UseInterceptors,
  FileTypeValidator,
  ParseFilePipe,
  Delete,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { DecodeUser } from 'src/common/decorators/decode-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserWithoutPassword } from 'src/common/types/user';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MediaService } from '../media/media.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaType, UserRole } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly mediaService: MediaService,
  ) {}

  @ApiOperation({ summary: 'Get current user' })
  @ApiBearerAuth()
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getMe(@DecodeUser() user: UserWithoutPassword) {
    return this.usersService.findById(user.id, user.id);
  }

  @ApiOperation({ summary: 'Upload avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        type: {
          type: 'string',
          enum: Object.values(MediaType),
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @Post('avatar')
  async uploadAvatar(
    @DecodeUser() user: UserWithoutPassword,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: /^(image\/jpeg|image\/png)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.mediaService.uploadAvatar(user.id, file);
  }

  @ApiOperation({ summary: 'Delete avatar' })
  @ApiBearerAuth()
  @Delete('avatar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.USER)
  async deleteAvatar(@DecodeUser() user: UserWithoutPassword) {
    await this.mediaService.deleteAvatar(user.id);
    return { message: 'Avatar deleted' };
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'skip', required: false })
  @Get()
  async findAll(
    @Query('query') query: string,
    @Query('take') take: number,
    @Query('skip') skip: number,
  ) {
    return this.usersService.findAll(query, take, skip);
  }

  @ApiOperation({ summary: 'Get user by id' })
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @DecodeUser() user?: UserWithoutPassword,
  ) {
    return this.usersService.findById(id, user?.id);
  }

  @ApiOperation({ summary: 'Update user by id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
        },
        email: {
          type: 'string',
        },
        password: {
          type: 'string',
        },
        role: {
          type: 'string',
          enum: Object.values(UserRole).filter(
            (role) => role !== UserRole.ADMIN,
          ),
        },
        sphereOfActivity: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        phone: {
          type: 'string',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @Patch(':id')
  async updateUserById(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @DecodeUser() user: UserWithoutPassword,
  ) {
    return this.usersService.update(id, dto, user);
  }

  @ApiOperation({ summary: 'Delete user by id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteUserById(
    @Param('id') id: string,
    @DecodeUser() user: UserWithoutPassword,
  ) {
    return this.usersService.delete(id, user);
  }
}
