import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  IsObject,
  IsArray,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class EventFiltersDto {
  @ApiProperty({ required: false, example: 'IT' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  query?: string;

  @ApiProperty({
    required: false,
    type: [String],
    example: [
      '965d6a7e-3efb-45a9-9601-f0d88672cf9f',
      '965d6a7e-3efb-45a9-9601-f0d88672cf9f',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];
}

export class SearchEventDto {
  @ApiProperty({ required: false, type: () => EventFiltersDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => EventFiltersDto)
  filters?: EventFiltersDto;
}
