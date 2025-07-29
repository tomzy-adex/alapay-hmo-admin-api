import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateHmoDto {
  @ApiProperty({
    description: 'Name of the HMO',
    example: 'HealthCare Plus',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Email address of the HMO',
    example: 'contact@healthcareplus.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Phone number of the HMO in international format',
    example: '+2348012345678',
    pattern: '^\\+[1-9]\\d{1,14}$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message:
      'Phone number must be in international format (e.g., +2348012345678)',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'Physical address of the HMO',
    example: '123 Healthcare Street, Lagos, Nigeria',
  })
  @IsString()
  @IsNotEmpty()
  address: string;
}
