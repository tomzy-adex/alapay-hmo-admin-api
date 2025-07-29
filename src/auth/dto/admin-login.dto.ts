import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsString,
  MinLength,
} from 'class-validator';

export class AdminLogindto {
  @ApiProperty({
    description: 'Email address of the admin',
    example: 'admin@example.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password for authentication',
    example: 'Password123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Email address for password reset',
    example: 'admin@example.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class UpdateAdminDto {
  @ApiProperty({
    description: 'Verification code received via email',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsNumberString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'New password',
    example: 'NewPassword123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}
