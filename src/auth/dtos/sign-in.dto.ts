import { IsNotEmpty, ValidateIf } from 'class-validator';

export class SignInDto {
  @ValidateIf((o) => !o.email || o.username)
  @IsNotEmpty()
  username: string;

  @ValidateIf((o) => !o.username || o.email)
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
