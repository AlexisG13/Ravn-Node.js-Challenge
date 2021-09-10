import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Post, Reaction } from '@prisma/client';
import { ReactionsService } from '../reactions/reactions.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { ReactPostDto } from './dtos/react-post.dto';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private reactionService: ReactionsService,
  ) {}

  async getPost(postId: string, options = { onlyLive: true }): Promise<Post> {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (options.onlyLive === true && !post.isLive) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async getDraft(postId: string, userId: string): Promise<Post> {
    const post = await this.getPost(postId, { onlyLive: false });
    if (post.authorId !== userId) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async getUserPosts(
    userId: string,
    options = { onlyLive: true },
  ): Promise<Post[]> {
    const usersPosts = await this.prisma.post.findMany({
      where: { AND: [{ authorId: userId }, { isLive: options.onlyLive }] },
    });
    if (usersPosts.length === 0) {
      throw new NotFoundException('User has no posts created');
    }
    return usersPosts;
  }

  async deletePost(userId: string, postId: string) {
    const deletedPost = await this.prisma.post.deleteMany({
      where: { AND: [{ id: postId }, { authorId: userId }] },
    });
    if (deletedPost.count === 0) throw new NotFoundException('Post not found');
  }

  async createPost(
    { title, content, isLive: isDraft }: CreatePostDto,
    userId: string,
  ): Promise<Post> {
    const post = await this.prisma.$transaction(async (prisma) => {
      const newPost = await prisma.post.create({
        data: {
          title,
          content,
          isLive: isDraft,
          author: { connect: { id: userId } },
        },
      });
      await prisma.reactable.create({
        data: {
          resourceId: newPost.id,
          resourceType: newPost.resourceType,
        },
      });
      return newPost;
    });
    return post;
  }

  async updatePost(
    createPostDto: CreatePostDto,
    postId: string,
    userId: string,
  ): Promise<Post> {
    const post = await this.getPost(postId);
    if (post.authorId !== userId) {
      throw new NotFoundException('Post not found');
    }
    if (post.isLive === true && createPostDto.isLive === false) {
      throw new ConflictException('The post is already published');
    }
    return this.prisma.post.update({
      where: { id: post.id },
      data: { ...createPostDto },
    });
  }

  async reactToPost(
    { reactionId }: ReactPostDto,
    userId: string,
    postId: string,
  ): Promise<Reaction> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { reactable: true },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return this.reactionService.createReaction(post, userId, reactionId);
  }

  async getPostReactions(postId: string) {
    const post = await this.getPost(postId);
    const reactions = await this.prisma.reaction.findMany({
      where: { resourceId: post.id },
    });
    if (reactions.length === 0) {
      throw new NotFoundException('Post has no reactions');
    }
    return reactions;
  }
}
