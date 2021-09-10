import { IsDefined, IsNotEmpty } from 'class-validator';

export class ReactPostDto {
  @IsNotEmpty()
  reactionId: string;
}
