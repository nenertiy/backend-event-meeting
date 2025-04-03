import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { EventFormat, EventStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ description: 'Event title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Event description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Event format' })
  @IsEnum(EventFormat)
  @IsNotEmpty()
  format: EventFormat;

  @ApiProperty({ description: 'Event status' })
  @IsEnum(EventStatus)
  @IsNotEmpty()
  status: EventStatus;

  @ApiProperty({ type: Date })
  @IsDateString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date.toISOString();
  })
  startDate: Date;

  @ApiProperty({ type: Date })
  @IsDateString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date.toISOString();
  })
  endDate: Date;

  @ApiProperty({ description: 'Event duration' })
  @IsNumber()
  @IsOptional()
  duration: number;

  @ApiProperty({ description: 'Event address' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: 'Event latitude' })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({ description: 'Event longitude' })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({ description: 'Event capacity' })
  @IsNumber()
  @IsOptional()
  capacity: number;

  @ApiProperty({ description: 'Event participants count' })
  @IsNumber()
  @IsNotEmpty()
  participantsCount: number;
}
