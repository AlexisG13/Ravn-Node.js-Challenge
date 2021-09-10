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
import { Reaction, User } from '@prisma/client';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { CommentsService } from './comments.service';
import { PostCommentDto } from './dtos/post-comment.dto';
import { ReactCommentDto } from './dtos/react-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Delete('/:commentId')
  @UseGuards(AuthGuard())
  deleteComment(@Param('commentId') commentId: string, @GetUser() user: User) {
    return this.commentsService.deleteComment(commentId, user.id);
  }

  @Post('/:commentId/reactions')
  @UseGuards(AuthGuard())
  reactToComment(
    @Param('commentId') commentId: string,
    @GetUser() user: User,
    @Body() reactCommentDto: ReactCommentDto,
  ): Promise<Reaction> {
    return this.commentsService.reactToComment(
      reactCommentDto,
      user.id,
      commentId,
    );
  }
}
