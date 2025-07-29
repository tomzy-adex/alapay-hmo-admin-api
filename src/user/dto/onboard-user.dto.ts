import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  ArrayNotEmpty,
  IsEmail,
  IsString,
  IsUUID,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { OnboardingType } from '../../utils/types';

export class OnboardAccountDto {
  @ApiProperty({
    type: [String],
    description: 'Array of email addresses to onboard',
    example: ['user1@example.com', 'user2@example.com'],
    format: 'email',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  emails: string[];

  @ApiProperty({
    description: 'UUID of the role to assign to the users',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    format: 'uuid',
  })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  roleId: string;

  @ApiProperty({
    enum: OnboardingType,
    description: 'Type of onboarding process',
    example: OnboardingType.HEALTHCARE_PROVIDER,
    enumName: 'OnboardingType',
  })
  @IsEnum(OnboardingType)
  @IsNotEmpty()
  onboardingType: OnboardingType;
}
