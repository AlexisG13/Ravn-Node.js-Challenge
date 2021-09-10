import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Post } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { ReactPostDto } from './dtos/react-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async getPost(postId: string): Promise<Post> {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    const usersPosts = await this.prisma.post.findMany({
      where: { authorId: userId },
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
    { title, content, isDraft }: CreatePostDto,
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
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (post.authorId !== userId) {
      throw new NotFoundException('Post not found');
    }
    if (post.isLive === true && createPostDto.isDraft === true) {
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
  ) {
    const reaction = await this.prisma.reactionReference.findUnique({
      where: { id: reactionId },
    });
    if (!reaction) {
      throw new BadRequestException('Invalid reaction');
    }
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { reactable: true },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return this.prisma.reaction.create({
      data: {
        reactable: {
          connect: {
            resourceId_resourceType: {
              resourceId: post.reactable.resourceId,
              resourceType: post.reactable.resourceType,
            },
          },
        },
        User: { connect: { id: userId } },
        reactionType: { connect: { id: reactionId } },
      },
    });
  }
}
