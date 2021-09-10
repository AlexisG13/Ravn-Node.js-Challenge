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
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('posts')
export class PostsController {
  constructor(
    private postService: PostsService,
    private commentsService: CommentsService,
  ) {}

  @ApiBearerAuth()
  @Get()
  @UseGuards(AuthGuard())
  getMyPosts(@GetUser() user: User): Promise<PostEntity[]> {
    return this.postService.getUserPosts(user.id);
  }

  @ApiBearerAuth()
  @Get('/drafts')
  @UseGuards(AuthGuard())
  getMyDrafts(@GetUser() user: User): Promise<PostEntity[]> {
    return this.postService.getUserPosts(user.id, { onlyLive: false });
  }

  @Get('/:postId')
  getPost(@Param('postId') postId: string): Promise<PostEntity> {
    return this.postService.getPost(postId);
  }

  @ApiBearerAuth()
  @Get('/:postId/draft')
  @UseGuards(AuthGuard())
  getDraft(
    @Param('postId') postId: string,
    @GetUser() user: User,
  ): Promise<PostEntity> {
    return this.postService.getDraft(postId, user.id);
  }

  @ApiBearerAuth()
  @Post()
  @UseGuards(AuthGuard())
  createPost(
    @Body() createPostDto: CreatePostDto,
    @GetUser() user: User,
  ): Promise<PostEntity> {
    return this.postService.createPost(createPostDto, user.id);
  }

  @ApiBearerAuth()
  @Put('/:postId')
  @UseGuards(AuthGuard())
  updatePost(
    @Param('postId') postId: string,
    @GetUser() user: User,
    @Body() createPostDto: CreatePostDto,
  ): Promise<PostEntity> {
    return this.postService.updatePost(createPostDto, postId, user.id);
  }

  @ApiBearerAuth()
  @Delete('/:postId')
  @UseGuards(AuthGuard())
  deletePost(
    @Param('postId') postId: string,
    @GetUser() user: User,
  ): Promise<void> {
    return this.deletePost(postId, user);
  }

  @ApiBearerAuth()
  @Post('/:postId/reactions')
  @UseGuards(AuthGuard())
  reactToPost(
    @Param('postId') postId: string,
    @Body() reactPostDto: ReactPostDto,
    @GetUser() user: User,
  ): Promise<Reaction> {
    return this.reactToPost(postId, reactPostDto, user);
  }

  @Get('/:postId/reactions')
  getPostReactions(@Param('postId') postId: string): Promise<Reaction[]> {
    return this.postService.getPostReactions(postId);
  }

  @Get('/:postId/comments')
  getPostComments(@Param('postId') postId: string): Promise<Comment[]> {
    return this.commentsService.getPostComments(postId);
  }

  @ApiBearerAuth()
  @Post('/:postId/comments')
  @UseGuards(AuthGuard())
  postComment(
    @Param('postId') postId: string,
    @GetUser() user: User,
    @Body() postCommentDto: PostCommentDto,
  ): Promise<Comment> {
    return this.commentsService.postComment(postCommentDto, user.id, postId);
  }
}
