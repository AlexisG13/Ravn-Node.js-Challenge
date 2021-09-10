import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ReactionsModule } from 'src/reactions/reactions.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [CommentsService],
  controllers: [CommentsController],
  imports: [PrismaModule, ReactionsModule, AuthModule],
  exports: [CommentsService],
})
export class CommentsModule {}
