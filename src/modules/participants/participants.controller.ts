import {
  Controller,
  Param,
  Patch,
  Body,
  UseGuards,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { Visibility } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserWithoutPassword } from 'src/common/types/user';
import { DecodeUser } from 'src/common/decorators/decode-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Participants')
@Controller('participants')
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user all participants' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getAllParticipants(@DecodeUser() user: UserWithoutPassword) {
    return this.participantsService.findByUserId(user.id);
  }

  @Patch(':id/visibility')
  @ApiOperation({ summary: 'Change participant visibility' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        visibility: { type: 'string', enum: Object.values(Visibility) },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  async changeVisibility(
    @Param('id') id: string,
    @Body() body: { visibility: Visibility },
  ) {
    return this.participantsService.changeVisibility(id, body.visibility);
  }
}
