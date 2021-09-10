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
}
