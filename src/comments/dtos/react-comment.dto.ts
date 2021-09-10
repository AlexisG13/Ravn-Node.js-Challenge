import { IsNotEmpty } from 'class-validator';

export class ReactCommentDto {
  @IsNotEmpty()
  reactionId: string;
}
