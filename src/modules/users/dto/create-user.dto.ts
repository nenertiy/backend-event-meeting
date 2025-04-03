import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
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

  @ApiProperty({ default: 'USER' })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiProperty({ default: 'IT' })
  @IsString()
  @IsOptional()
  sphereOfActivity?: string;

  @ApiProperty({ default: 'description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ default: '+380991234567' })
  @IsString()
  @IsOptional()
  phone?: string;
}
