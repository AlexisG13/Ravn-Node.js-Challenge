import { IsBoolean, IsNotEmpty, Length, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @MaxLength(30)
  title: string;

  @IsNotEmpty()
  @Length(10, 3000)
  content: string;

  @IsBoolean()
  isDraft: boolean;
}
