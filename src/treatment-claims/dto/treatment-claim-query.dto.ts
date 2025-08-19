import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsUUID, IsNumber, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ClaimStatus, ClaimType, ProcessStatus } from '../../utils/types';

export class TreatmentClaimSearchDto {
  @ApiProperty({
    description: 'Search term for claim reference, user name, or hospital name',
    example: 'CLM001',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by claim status',
    enum: ClaimStatus,
    example: ClaimStatus.PENDING,
    required: false,
  })
  @IsOptional()
  @IsEnum(ClaimStatus)
  status?: ClaimStatus;

  @ApiProperty({
    description: 'Filter by claim type',
    enum: ClaimType,
    example: ClaimType.MEDICAL,
    required: false,
  })
  @IsOptional()
  @IsEnum(ClaimType)
  type?: ClaimType;

  @ApiProperty({
    description: 'Filter by user ID',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({
    description: 'Filter by HMO ID',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  hmoId?: string;

  @ApiProperty({
    description: 'Filter by hospital ID',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  hospitalId?: string;

  @ApiProperty({
    description: 'Filter by healthcare plan ID',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  planId?: string;

  @ApiProperty({
    description: 'Filter by minimum amount',
    example: 1000,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  minAmount?: number;

  @ApiProperty({
    description: 'Filter by maximum amount',
    example: 100000,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  maxAmount?: number;

  @ApiProperty({
    description: 'Filter by start date (ISO string)',
    example: '2024-01-01T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Filter by end date (ISO string)',
    example: '2024-12-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Filter by year',
    example: 2024,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  year?: number;

  @ApiProperty({
    description: 'Filter by month (1-12)',
    example: 6,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  month?: number;

  @ApiProperty({
    description: 'Filter by payment status',
    enum: ProcessStatus,
    example: ProcessStatus.PENDING,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProcessStatus)
  paymentStatus?: ProcessStatus;

  @ApiProperty({
    description: 'Filter by authorization code',
    example: 'AUTH001',
    required: false,
  })
  @IsOptional()
  @IsString()
  authorizationCode?: string;

  @ApiProperty({
    description: 'Filter by provider reference',
    example: 'PROV001',
    required: false,
  })
  @IsOptional()
  @IsString()
  providerReference?: string;

  @ApiProperty({
    description: 'Filter by enrollee number',
    example: 'ENR001',
    required: false,
  })
  @IsOptional()
  @IsString()
  enrolleeNo?: string;

  @ApiProperty({
    description: 'Filter by claim reference',
    example: 'CLM001',
    required: false,
  })
  @IsOptional()
  @IsString()
  claimReference?: string;

  @ApiProperty({
    description: 'Filter by diagnosis',
    example: 'Hypertension',
    required: false,
  })
  @IsOptional()
  @IsString()
  diagnosis?: string;

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

  @ApiProperty({
    description: 'Export format (csv, excel, pdf)',
    example: 'csv',
    enum: ['csv', 'excel', 'pdf'],
    required: false,
  })
  @IsOptional()
  @IsString()
  exportFormat?: 'csv' | 'excel' | 'pdf';
}
