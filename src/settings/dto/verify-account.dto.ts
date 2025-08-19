import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';

export class VerifyAccountDto {
  @ApiProperty({
    description: 'Email address to verify',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Verification code sent to email',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  verificationCode: string;

  @ApiProperty({
    description: 'User ID (optional, for admin verification)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class ResendVerificationDto {
  @ApiProperty({
    description: 'Email address to resend verification code',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User ID (optional, for admin resend)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;
}
