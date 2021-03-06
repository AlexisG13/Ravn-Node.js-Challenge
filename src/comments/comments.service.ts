import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostCommentDto } from './dtos/post-comment.dto';
import { Comment, CommentReaction } from 'prisma/prisma-client';
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
    const comment = await this.prisma.comment.create({
      data: {
        content,
        author: { connect: { id: userId } },
        post: { connect: { id: postId } },
        isLive,
      },
    });
    return comment;
  }

  async getPostComments(postId: string): Promise<Comment[]> {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    const comments = await this.prisma.comment.findMany({
      where: { AND: [{ postId }, { isLive: true }] },
    });
    if (comments.length === 0) {
      throw new NotFoundException('The post has no comments');
    }
    return comments;
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const queryResult = await this.prisma.comment.deleteMany({
      where: { AND: [{ id: commentId }, { authorId: userId }] },
    });
    if (queryResult.count === 0) {
      throw new NotFoundException('The comment does not exist');
    }
  }

  async updateComment(
    { content, isLive }: PostCommentDto,
    commentId: string,
    userId: string,
  ): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.authorId !== userId) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.isLive === true && isLive === false) {
      throw new ConflictException('The comment is already published');
    }
    return this.prisma.comment.update({
      where: { id: comment.id },
      data: { content, isLive },
    });
  }

  async reactToComment(
    { reactionId }: ReactCommentDto,
    userId: string,
    commentId: string,
  ): Promise<CommentReaction> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return this.reactionService.createCommentReaction(
      comment.id,
      userId,
      reactionId,
    );
  }

  async getUserComments(userId: string): Promise<Comment[]> {
    const comments = await this.prisma.comment.findMany({
      where: { authorId: userId },
    });
    if (comments.length === 0) {
      throw new NotFoundException('User has no comments');
    }
    return comments;
  }
}
