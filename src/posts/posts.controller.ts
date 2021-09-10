import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Post as PostEntity, Reaction, User, Comment } from '@prisma/client';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { CommentsService } from 'src/comments/comments.service';
import { PostCommentDto } from 'src/comments/dtos/post-comment.dto';
import { CreatePostDto } from './dtos/create-post.dto';
import { ReactPostDto } from './dtos/react-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(
    private postService: PostsService,
    private commentsService: CommentsService,
  ) {}

  @Get()
  @UseGuards(AuthGuard())
  getMyPosts(@GetUser() user: User): Promise<PostEntity[]> {
    return this.postService.getUserPosts(user.id);
  }

  @Get('/drafts')
  @UseGuards(AuthGuard())
  getMyDrafts(@GetUser() user: User): Promise<PostEntity[]> {
    return this.postService.getUserPosts(user.id, { onlyLive: false });
  }
}
