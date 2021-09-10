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

  @Get('/:postId')
  getPost(@Param('postId') postId: string): Promise<PostEntity> {
    return this.postService.getPost(postId);
  }

  @Get('/:postId/draft')
  @UseGuards(AuthGuard())
  getDraft(
    @Param('postId') postId: string,
    @GetUser() user: User,
  ): Promise<PostEntity> {
    return this.postService.getDraft(postId, user.id);
  }

  @Post()
  @UseGuards(AuthGuard())
  createPost(
    @Body() createPostDto: CreatePostDto,
    @GetUser() user: User,
  ): Promise<PostEntity> {
    return this.postService.createPost(createPostDto, user.id);
  }

  @Put('/:postId')
  updatePost(
    @Param('postId') postId: string,
    @GetUser() user: User,
    @Body() createPostDto: CreatePostDto,
  ): Promise<PostEntity> {
    return this.postService.updatePost(createPostDto, postId, user.id);
  }
}
