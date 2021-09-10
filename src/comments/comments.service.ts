import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostCommentDto } from './dtos/post-comment.dto';
import { Comment, Reaction } from 'prisma/prisma-client';
import { ReactCommentDto } from './dtos/react-comment.dto';
import { ReactionsService } from '../reactions/reactions.service';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private reactionService: ReactionsService,
  ) {}

  async postComment(
    { content, isLive }: PostCommentDto,
    userId: string,
    postId: string,
  ): Promise<Comment> {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    const newComment = await this.prisma.$transaction(async (prisma) => {
      const comment = await this.prisma.comment.create({
        data: {
          content,
          author: { connect: { id: userId } },
          post: { connect: { id: postId } },
          isLive,
        },
      });
      await prisma.reactable.create({
        data: {
          resourceId: comment.id,
          resourceType: comment.resourceType,
        },
      });
      return comment;
    });
    return newComment;
  }

}
