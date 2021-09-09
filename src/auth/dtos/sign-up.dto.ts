import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email: string;

  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must be at least 8 characters long and have at least one special character, one number, and one uppercase letter',
    },
  )
  password: string;

  @Length(6, 15)
  username: string;

  @IsNotEmpty()
  name: string;
}
