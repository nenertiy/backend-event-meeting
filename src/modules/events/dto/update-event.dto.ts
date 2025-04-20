import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { EventFormat, EventStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateEventDto } from './create-event.dto';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @ApiProperty({ description: 'Event title', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Event description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false, default: 'https://example.com' })
  @IsString()
  @IsOptional()
  infoResource?: string;

  @ApiProperty({ description: 'Event format', required: false })
  @IsEnum(EventFormat)
  @IsOptional()
  format?: EventFormat;

  @ApiProperty({ description: 'Event status', required: false })
  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @ApiProperty({ type: Date, required: false })
  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date.toISOString();
  })
  startDate?: Date;

  @ApiProperty({ type: Date, required: false })
  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date.toISOString();
  })
  endDate?: Date;

  @ApiProperty({ type: Date, required: false })
  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date.toISOString();
  })
  registrationDeadline?: Date;

  @ApiProperty({ description: 'Event duration', required: false })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiProperty({ description: 'Event address', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: 'Event latitude', required: false })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ description: 'Event longitude', required: false })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({ description: 'Event capacity', required: false })
  @IsNumber()
  @IsOptional()
  capacity?: number;

  @ApiProperty({ description: 'Event participants count', required: false })
  @IsNumber()
  @IsOptional()
  participantsCount?: number;
}
