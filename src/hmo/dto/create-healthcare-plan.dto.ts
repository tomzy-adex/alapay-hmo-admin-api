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
} from 'class-validator';
import { BaseEntity } from 'src/config/repository/base-entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHealthcarePlanDto extends BaseEntity {
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
    example: {
      outpatient: true,
      inpatient: true,
      dental: true,
      optical: true,
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  planBenefits?: Record<string, any>;
}

export class CreateFamilyDiscountsDto {
  @ApiProperty({
    description: 'Number of family members',
    example: 4,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  familySize: number;

  @ApiProperty({
    description: 'Discount percentage for the family size',
    example: 15,
    minimum: 0,
    maximum: 100,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  discount: number;

  @ApiProperty({
    description: 'Base price for the family plan',
    example: 50000,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  basePrice: number;
}
