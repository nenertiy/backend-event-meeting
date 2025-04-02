import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';

export class SignUpDto extends CreateUserDto {
  @ApiProperty({ default: 'user' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ default: 'user@gmail.com' })
  @Transform(({ value }) => value.toLowerCase())
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ default: 'password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
