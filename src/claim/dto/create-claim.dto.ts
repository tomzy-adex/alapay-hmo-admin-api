import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsUUID,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ClaimType } from 'src/utils/types';

export class CreateClaimDto {
  @ApiProperty({
    description: 'Type of claim',
    enum: ClaimType,
    example: ClaimType.MEDICAL,
  })
  @IsEnum(ClaimType)
  @IsNotEmpty()
  type: ClaimType;

  @ApiProperty({
    description: 'Description of the claim',
    example: 'Annual medical checkup',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Amount being claimed',
    example: 50000,
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'UUID of the user making the claim',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'UUID of the hospital',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
  })
  @IsUUID()
  @IsNotEmpty()
  hospitalId: string;

  @ApiProperty({
    description: 'Date of service',
    example: '2024-03-20',
  })
  @IsDateString()
  @IsNotEmpty()
  serviceDate: Date;

  @ApiProperty({
    description: 'Additional notes or documentation',
    example: 'Including lab tests and consultation',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Reference number from hospital',
    example: 'REF123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  providerReference?: string;
}
