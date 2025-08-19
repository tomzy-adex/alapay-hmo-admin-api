import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsArray,
  IsUUID,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProcessStatus, Status } from '../../utils/types';

export class HcpContactInfoDto {
  @ApiProperty({
    description: 'Primary contact email',
    example: 'contact@hospital.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Primary contact phone number',
    example: '+2348012345678',
    pattern: '^\\+[1-9][0-9]{7,14}$',
  })
  @IsNotEmpty()
  @Matches(/^\+[1-9][0-9]{7,14}$/, {
    message: 'Phone number must be in international format, starting with + followed by 8 to 15 digits',
  })
  phone: string;

  @ApiProperty({
    description: 'Secondary contact phone number (optional)',
    example: '+2348012345679',
    pattern: '^\\+[1-9][0-9]{7,14}$',
    required: false,
  })
  @IsOptional()
  @Matches(/^\+[1-9][0-9]{7,14}$/, {
    message: 'Phone number must be in international format, starting with + followed by 8 to 15 digits',
  })
  secondaryPhone?: string;

  @ApiProperty({
    description: 'Website URL (optional)',
    example: 'https://www.hospital.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  website?: string;
}

export class HcpFacilityInfoDto {
  @ApiProperty({
    description: 'Type of healthcare facility',
    example: 'General Hospital',
    enum: ['General Hospital', 'Specialist Hospital', 'Clinic', 'Diagnostic Center', 'Pharmacy', 'Laboratory'],
  })
  @IsNotEmpty()
  @IsString()
  facilityType: string;

  @ApiProperty({
    description: 'Number of beds available',
    example: 100,
    required: false,
  })
  @IsOptional()
  bedCount?: number;

  @ApiProperty({
    description: 'Operating hours',
    example: '24/7',
    required: false,
  })
  @IsOptional()
  @IsString()
  operatingHours?: string;

  @ApiProperty({
    description: 'Specialties offered by the facility',
    example: ['Cardiology', 'Orthopedics', 'Pediatrics'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];
}

export class CreateHcpDto {
  @ApiProperty({
    description: 'Name of the healthcare provider',
    example: 'City General Hospital',
    minLength: 3,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Physical address of the healthcare provider',
    example: '123 Healthcare Avenue, Medical District, Lagos',
  })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Contact information for the healthcare provider',
    type: HcpContactInfoDto,
  })
  @ValidateNested()
  @Type(() => HcpContactInfoDto)
  contactInfo: HcpContactInfoDto;

  @ApiProperty({
    description: 'Facility information and capabilities',
    type: HcpFacilityInfoDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => HcpFacilityInfoDto)
  facilityInfo?: HcpFacilityInfoDto;

  @ApiProperty({
    description: 'UUIDs of healthcare plans accepted by this provider',
    example: ['d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0'],
    type: [String],
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsArray()
  @IsUUID('4', { each: true })
  planIds: string[];

  @ApiProperty({
    description: 'UUIDs of HMOs this provider is affiliated with',
    example: ['d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0'],
    type: [String],
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  hmoIds?: string[];

  @ApiProperty({
    description: 'Whether the provider offers emergency services',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  emergencyServiceProvider?: boolean;

  @ApiProperty({
    description: 'Status of the healthcare provider',
    enum: ProcessStatus,
    example: ProcessStatus.PENDING,
    required: false,
  })
  @IsOptional()
  status?: ProcessStatus;

  @ApiProperty({
    description: 'Account status of the healthcare provider',
    enum: Status,
    example: Status.DORMANT,
    required: false,
  })
  @IsOptional()
  accountStatus?: Status;

  @ApiProperty({
    description: 'Verification comments or notes',
    example: 'Provider verified and approved',
    required: false,
  })
  @IsOptional()
  @IsString()
  verificationComments?: string;

  @ApiProperty({
    description: 'Additional metadata about the provider',
    example: {
      accreditation: 'JCI Accredited',
      yearEstablished: 1995,
      ownership: 'Private',
    },
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
