import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentReaction, User } from '@prisma/client';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { CommentsService } from './comments.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PostCommentDto } from './dtos/post-comment.dto';
import { ReactCommentDto } from './dtos/react-comment.dto';
import { SignInGuard } from 'src/auth/guards/sign-in.guard';

@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @ApiBearerAuth()
  @Delete('/:commentId')
  @UseGuards(AuthGuard(), SignInGuard)
  deleteComment(@Param('commentId') commentId: string, @GetUser() user: User) {
    return this.commentsService.deleteComment(commentId, user.id);
  }

  @ApiBearerAuth()
  @Post('/:commentId/reactions')
  @UseGuards(AuthGuard(), SignInGuard)
  reactToComment(
    @Param('commentId') commentId: string,
    @GetUser() user: User,
    @Body() reactCommentDto: ReactCommentDto,
  ): Promise<CommentReaction> {
    return this.commentsService.reactToComment(
      reactCommentDto,
      user.id,
      commentId,
    );
  }

  @ApiBearerAuth()
  @Put('/:commentId')
  @UseGuards(AuthGuard(), SignInGuard)
  updateComment(
    @Param('commentId') commentId: string,
    @GetUser() user: User,
    @Body() postCommentDto: PostCommentDto,
  ): Promise<Comment> {
    return this.updateComment(commentId, user, postCommentDto);
  }
}
