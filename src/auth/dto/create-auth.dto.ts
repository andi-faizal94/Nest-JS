import { IsNotEmpty, IsEmail, IsString, Length } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @IsString()
  @Length(8)
  password: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
