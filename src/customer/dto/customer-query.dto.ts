import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { Status, ProcessStatus } from '../../utils/types';

export class CustomerSearchDto {
  @ApiProperty({
    description: 'Search term for customer name, email, or phone number',
    example: 'john',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by customer status',
    enum: Status,
    example: Status.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @ApiProperty({
    description: 'Filter by account status',
    enum: ProcessStatus,
    example: ProcessStatus.APPROVED,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProcessStatus)
  accountStatus?: ProcessStatus;

  @ApiProperty({
    description: 'Filter by HMO ID',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  hmoId?: string;

  @ApiProperty({
    description: 'Filter by organization ID',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @ApiProperty({
    description: 'Filter by gender',
    example: 'male',
    required: false,
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({
    description: 'Filter by blood group',
    example: 'O+',
    required: false,
  })
  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @ApiProperty({
    description: 'Filter by email verification status',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isEmailVerified?: boolean;

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

export class CustomerFilterDto {
  @ApiProperty({
    description: 'Filter by date range - start date',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Filter by date range - end date',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Filter by minimum height',
    example: 150,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  minHeight?: number;

  @ApiProperty({
    description: 'Filter by maximum height',
    example: 200,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  maxHeight?: number;
}
