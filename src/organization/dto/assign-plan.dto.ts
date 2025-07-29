import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  IsDate,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class BenefitDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  limit?: number;
}

class CoverageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  service: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  percentage: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  limit?: number;
}

export class AssignPlanDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  organizationId: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  planId: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endDate: Date;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  pricePerEmployee: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  maxEmployees: number;

  @ApiProperty({ type: [BenefitDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BenefitDto)
  @IsOptional()
  benefits?: BenefitDto[];

  @ApiProperty({ type: [CoverageDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CoverageDto)
  @IsOptional()
  coverage?: CoverageDto[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
