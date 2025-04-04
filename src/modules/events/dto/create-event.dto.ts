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
  IsArray,
  IsUUID,
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

  @ApiProperty({
    description: 'Array of tag IDs',
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds: string[];
}
