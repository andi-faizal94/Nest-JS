import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginAuthDto {
  //   @IsNotEmpty()
  //   username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
