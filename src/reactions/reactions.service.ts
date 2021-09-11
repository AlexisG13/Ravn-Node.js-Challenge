import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CommentReaction,
  PostReaction,
  ReactionReference,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReactionsService {
  constructor(private prisma: PrismaService) {}

  async createCommentReaction(
    commentId: string,
    userId: string,
    reactionId: string,
  ): Promise<CommentReaction> {
    const reaction = await this.getReaction(reactionId);
    return this.prisma.commentReaction.create({
      data: {
        user: { connect: { id: userId } },
        comment: { connect: { id: commentId } },
        reaction: { connect: { id: reaction.id } },
      },
    });
  }

  async createPostReaction(
    postId: string,
    userId: string,
    reactionId: string,
  ): Promise<PostReaction> {
    const reaction = await this.getReaction(reactionId);
    return this.prisma.postReaction.create({
      data: {
        user: { connect: { id: userId } },
        post: { connect: { id: postId } },
        reaction: { connect: { id: reaction.id } },
      },
    });
  }

  async getReaction(reactionId: string): Promise<ReactionReference> {
    const reaction = await this.prisma.reactionReference.findUnique({
      where: { id: reactionId },
    });
    if (!reaction) {
      throw new NotFoundException('Reaction not found');
    }
    return reaction;
  }

  getReactions(): Promise<ReactionReference[]> {
    return this.prisma.reactionReference.findMany();
  }
}
