import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { CommentsModule } from 'src/comments/comments.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ReactionsModule } from 'src/reactions/reactions.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  controllers: [PostsController],
  providers: [PostsService],
  imports: [PrismaModule, ReactionsModule, CommentsModule, AuthModule],
  exports: [PostsService],
})
export class PostsModule {}
