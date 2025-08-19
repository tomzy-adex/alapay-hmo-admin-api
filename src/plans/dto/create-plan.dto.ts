import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  IsObject,
  IsArray,
  IsUUID,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Status } from '../../utils/types';

export class PlanBenefitDto {
  @ApiProperty({
    description: 'Name of the benefit',
    example: 'Doctor Consultation',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Description of the benefit',
    example: 'Unlimited doctor consultations',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Coverage limit for this benefit',
    example: 100000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  limit?: number;

  @ApiProperty({
    description: 'Coverage percentage for this benefit',
    example: 80,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Min(100)
  percentage: number;
}

export class CreatePlanDto {
  @ApiProperty({
    description: 'Name of the healthcare plan',
    example: 'Premium Health Plan',
    minLength: 3,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Type of coverage provided by the plan',
    example: 'Comprehensive',
    enum: ['Basic', 'Standard', 'Comprehensive', 'Premium'],
  })
  @IsNotEmpty()
  @IsString()
  coverageType: string;

  @ApiProperty({
    description: 'Pricing structure of the plan',
    example: 'Monthly',
    enum: ['Daily', 'Weekly', 'Monthly', 'Yearly'],
  })
  @IsNotEmpty()
  @IsString()
  pricingStructure: string;

  @ApiProperty({
    description: 'HMO ID that owns this plan',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  hmoId: string;

  @ApiProperty({
    description: 'UUIDs of the account tiers associated with this plan',
    example: ['d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0'],
    type: [String],
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsArray()
  @IsUUID('4', { each: true })
  accountTierIds: string[];

  @ApiProperty({
    description: 'UUIDs of hospitals associated with this plan',
    example: ['d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0'],
    type: [String],
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  hospitalIds?: string[];

  @ApiProperty({
    description: 'Whether family plans are available',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  familyPlanAvailable?: boolean;

  @ApiProperty({
    description: 'Discount rate for dependent family members',
    example: 20,
    minimum: 0,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dependentDiscountRate?: number;

  @ApiProperty({
    description: 'Maximum number of dependents allowed',
    example: 5,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDependents?: number;

  @ApiProperty({
    description: 'Benefits included in the plan',
    type: [PlanBenefitDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanBenefitDto)
  planBenefits?: PlanBenefitDto[];

  @ApiProperty({
    description: 'Status of the plan',
    enum: Status,
    example: Status.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @ApiProperty({
    description: 'Minimum number of users required to activate the plan',
    example: 10,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minimumUsersRequired?: number;

  @ApiProperty({
    description: 'Minimum premium payment required to activate the plan',
    example: 50000.00,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumPremiumRequired?: number;
}
