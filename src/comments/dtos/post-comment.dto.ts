import { IsBoolean, IsNotEmpty } from 'class-validator';

export class PostCommentDto {
  @IsNotEmpty()
  content: string;
  @IsBoolean()
  isLive: boolean;
}
