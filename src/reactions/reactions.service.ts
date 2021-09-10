import { Injectable, NotFoundException } from '@nestjs/common';
import { Reaction, ReactionReference } from '@prisma/client';
import { ReactableResource } from '../reactions/types/reactable.type';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReactionsService {
  constructor(private prisma: PrismaService) {}

  async createReaction(
    resource: ReactableResource,
    userId: string,
    reactionId: string,
  ): Promise<Reaction> {
    const reaction = await this.getReaction(reactionId);
    return this.prisma.reaction.create({
      data: {
        reactable: {
          connect: {
            resourceId_resourceType: {
              resourceId: resource.reactable.resourceId,
              resourceType: resource.reactable.resourceType,
            },
          },
        },
        User: { connect: { id: userId } },
        reactionType: { connect: { id: reaction.id } },
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
