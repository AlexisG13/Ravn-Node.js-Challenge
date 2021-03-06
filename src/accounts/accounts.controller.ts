import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User, Post as PostEntity, Comment, Profile } from '@prisma/client';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { CommentsService } from 'src/comments/comments.service';
import { PostsService } from 'src/posts/posts.service';
import { AccountsService } from './accounts.service';
import { UpdateSettingsDto } from './dtos/update-settings.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SignInGuard } from 'src/auth/guards/sign-in.guard';

@Controller('accounts')
export class AccountsController {
  constructor(
    private accountsService: AccountsService,
    private postService: PostsService,
    private commentsService: CommentsService,
  ) {}

  @Get('/:userId')
  getAccountInfo(@Param('userId') userId: string) {
    return this.accountsService.getUserInfo(userId);
  }

  @ApiBearerAuth()
  @Put('/settings')
  @UseGuards(AuthGuard(), SignInGuard)
  updateSettings(
    @GetUser() user: User,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ) {
    return this.accountsService.updateSettings(user.id, updateSettingsDto);
  }

  @Get('/:userId/posts')
  getUserPosts(@Param('userId') userId: string): Promise<PostEntity[]> {
    return this.postService.getUserPosts(userId);
  }

  @Get('/:userId/comments')
  getUserComments(@Param('userId') userId: string): Promise<Comment[]> {
    return this.commentsService.getUserComments(userId);
  }

  @Get('/:userId/profile')
  getUserProfile(@Param('userId') userId: string): Promise<Profile> {
    return this.accountsService.getProfile(userId);
  }
}
