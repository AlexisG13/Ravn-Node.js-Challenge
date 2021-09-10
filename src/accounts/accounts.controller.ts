import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User, Post as PostEntity, Comment, Profile } from '@prisma/client';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { CommentsService } from 'src/comments/comments.service';
import { PostsService } from 'src/posts/posts.service';
import { AccountsService } from './accounts.service';
import { UpdateSettingsDto } from './dtos/update-settings.dto';

@Controller('accounts')
export class AccountsController {
  constructor(
    private accountsService: AccountsService,
    private postService: PostsService,
    private commentsService: CommentsService,
  ) {}
}
