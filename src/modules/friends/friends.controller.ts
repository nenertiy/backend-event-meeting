import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserWithoutPassword } from 'src/common/types/user';
import { DecodeUser } from 'src/common/decorators/decode-user.decorator';

@ApiTags('Friends')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @ApiOperation({ summary: 'Send a friend request to a user' })
  @Post('request/:userId')
  async sendFriendRequest(
    @DecodeUser() user: UserWithoutPassword,
    @Param('userId') userId: string,
  ) {
    return this.friendsService.sendFriendRequest(user.id, userId);
  }

  @ApiOperation({ summary: 'Get all friend requests' })
  @Get('requests')
  async getFriendRequests(@DecodeUser() user: UserWithoutPassword) {
    return this.friendsService.getFriendRequests(user.id);
  }

  @ApiOperation({ summary: 'Get friend requests to me' })
  @Get('requests/incoming')
  async getToMeRequests(@DecodeUser() user: UserWithoutPassword) {
    return this.friendsService.getToMeRequests(user.id);
  }

  @ApiOperation({ summary: 'Get friend requests from me' })
  @Get('requests/outgoing')
  async getMyRequests(@DecodeUser() user: UserWithoutPassword) {
    return this.friendsService.getMyRequests(user.id);
  }

  @ApiOperation({ summary: 'Accept a friend request' })
  @Post('accept/:id')
  async acceptFriendRequest(@Param('id') id: string) {
    return this.friendsService.acceptFriendRequest(id);
  }

  @ApiOperation({ summary: 'Reject a friend request' })
  @Post('reject/:id')
  async rejectFriendRequest(@Param('id') id: string) {
    return this.friendsService.rejectFriendRequest(id);
  }

  @ApiOperation({ summary: 'Cancel a friend request' })
  @Delete('cancel/:id')
  async cancelFriendRequest(@Param('id') id: string) {
    return this.friendsService.cancelFriendRequest(id);
  }

  @ApiOperation({ summary: 'Delete a friend' })
  @Delete('delete/:id')
  async deleteFriend(@Param('id') id: string) {
    return this.friendsService.deleteFriend(id);
  }

  @ApiOperation({ summary: 'Get my friends' })
  @Get()
  async getFriends(@DecodeUser() user: UserWithoutPassword) {
    return this.friendsService.getFriends(user.id);
  }

  @ApiOperation({ summary: 'Get my friend' })
  @Get(':id')
  async getFriend(@Param('id') id: string) {
    return this.friendsService.getFriend(id);
  }
}
