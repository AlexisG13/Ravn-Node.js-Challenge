import { Controller, Get } from '@nestjs/common';
import { ReactionReference } from '@prisma/client';
import { ReactionsService } from './reactions.service';

@Controller('reactions')
export class ReactionsController {
  constructor(private reactionsService: ReactionsService) {}

  @Get()
  getReactions(): Promise<ReactionReference[]> {
    return this.reactionsService.getReactions();
  }
}
