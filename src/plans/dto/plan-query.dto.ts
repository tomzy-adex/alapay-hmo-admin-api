import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsUUID, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { Status } from '../../utils/types';

export class PlanSearchDto {
  @ApiProperty({
    description: 'Search term for plan name or coverage type',
    example: 'premium',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by plan status',
    enum: Status,
    example: Status.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @ApiProperty({
    description: 'Filter by HMO ID',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  hmoId?: string;

  @ApiProperty({
    description: 'Filter by coverage type',
    example: 'Comprehensive',
    required: false,
  })
  @IsOptional()
  @IsString()
  coverageType?: string;

  @ApiProperty({
    description: 'Filter by pricing structure',
    example: 'Monthly',
    required: false,
  })
  @IsOptional()
  @IsString()
  pricingStructure?: string;

  @ApiProperty({
    description: 'Filter by family plan availability',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  familyPlanAvailable?: boolean;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    default: 10,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @ApiProperty({
    description: 'Sort field',
    example: 'createdAt',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Sort order (ASC or DESC)',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    required: false,
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class PlanSubscribersQueryDto {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    default: 10,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @ApiProperty({
    description: 'Filter by subscription status',
    enum: Status,
    example: Status.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @ApiProperty({
    description: 'Search term for subscriber name or enrollee number',
    example: 'john',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
