import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ReactionsService } from './reactions.service';
import { ReactionsController } from './reactions.controller';

@Module({
  providers: [ReactionsService],
  exports: [ReactionsService],
  imports: [PrismaModule],
  controllers: [ReactionsController],
})
export class ReactionsModule {}
