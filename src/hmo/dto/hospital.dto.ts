import { PartialType } from '@nestjs/swagger';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  IsArray,
} from 'class-validator';
import { HmoQueryDto } from './hmo-query.dto';

export class CreateHospitalDto {
  @ApiProperty({
    description: 'Name of the hospital',
    example: 'City General Hospital',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Physical address of the hospital',
    example: '123 Healthcare Avenue, Medical District',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Contact phone number in international format',
    example: '+2348012345678',
    pattern: '^\\+[1-9][0-9]{7,14}$',
  })
  @IsNotEmpty()
  @Matches(/^\+[1-9][0-9]{7,14}$/, {
    message:
      'Phone number must be in international format, starting with + followed by 8 to 15 digits',
  })
  phone: string;

  @ApiProperty({
    description: 'Contact email address',
    example: 'contact@citygeneral.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'UUIDs of healthcare plans offered by the hospital',
    example: ['d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0'],
    type: [String],
    format: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  @IsArray()
  @IsUUID('4', { each: true })
  planIds: string[];

  @ApiProperty({
    description: 'Whether the hospital provides emergency services',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  emergencyServiceProvider?: boolean;
}

export class UpdateHospitalDto extends PartialType(CreateHospitalDto) {}

export class CreateBulkHospitalDto extends OmitType(CreateHospitalDto, [
  'planIds',
] as const) {}

export class HospitalQueryDto extends HmoQueryDto {
  @ApiProperty({
    description: 'UUID of the hospital',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  hospitalId: string;
}
