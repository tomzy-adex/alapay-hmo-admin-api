import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateHmoDto {
  @ApiProperty({
    description: 'Name of the HMO',
    example: 'HealthCare Plus',
    minLength: 3,
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Email address of the HMO',
    example: 'contact@healthcareplus.com',
    format: 'email',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Phone number of the HMO in international format',
    example: '+2348012345678',
    pattern: '^\\+[1-9]\\d{1,14}$',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message:
      'Phone number must be in international format (e.g., +2348012345678)',
  })
  phoneNumber?: string;

  @ApiProperty({
    description: 'Physical address of the HMO',
    example: '123 Healthcare Street, Lagos, Nigeria',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;
}
