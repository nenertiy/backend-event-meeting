import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '@prisma/client';

export class UpdateUserDto {
  @ApiProperty({ required: false, default: 'user' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ required: false, default: 'user@gmail.com' })
  @Transform(({ value }) => value?.toLowerCase())
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false, default: 'password' })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({
    required: false,
    default: 'USER',
    enum: Object.values(UserRole).filter((role) => role !== UserRole.ADMIN),
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ required: false, default: 'IT' })
  @IsString()
  @IsOptional()
  sphereOfActivity?: string;

  @ApiProperty({ required: false, default: 'description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false, default: '+380991234567' })
  @IsString()
  @IsOptional()
  phone?: string;
}
