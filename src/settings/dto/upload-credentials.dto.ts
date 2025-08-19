import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class UploadCredentialsDto {
  @ApiProperty({
    description: 'Type of credential being uploaded',
    example: 'medical_license',
    enum: ['medical_license', 'professional_certificate', 'identity_document', 'business_license', 'other'],
  })
  @IsString()
  @IsNotEmpty()
  credentialType: 'medical_license' | 'professional_certificate' | 'identity_document' | 'business_license' | 'other';

  @ApiProperty({
    description: 'Title or name of the credential',
    example: 'Medical License - Lagos State',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Description of the credential',
    example: 'Valid medical license issued by Lagos State Medical Board',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'File URL or base64 encoded file',
    example: 'https://example.com/credentials/medical-license.pdf',
  })
  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @ApiProperty({
    description: 'File name',
    example: 'medical-license.pdf',
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
    required: false,
  })
  @IsOptional()
  fileSize?: number;

  @ApiProperty({
    description: 'File type/MIME type',
    example: 'application/pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  fileType?: string;

  @ApiProperty({
    description: 'Expiration date (ISO string)',
    example: '2025-12-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsString()
  expirationDate?: string;

  @ApiProperty({
    description: 'Issuing authority',
    example: 'Lagos State Medical Board',
    required: false,
  })
  @IsOptional()
  @IsString()
  issuingAuthority?: string;

  @ApiProperty({
    description: 'Credential number or ID',
    example: 'ML-2024-001234',
    required: false,
  })
  @IsOptional()
  @IsString()
  credentialNumber?: string;

  @ApiProperty({
    description: 'Additional metadata as JSON string',
    example: '{"category": "professional", "priority": "high"}',
    required: false,
  })
  @IsOptional()
  @IsString()
  metadata?: string;
}

export class UpdateCredentialDto {
  @ApiProperty({
    description: 'Credential ID',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
  })
  @IsString()
  @IsNotEmpty()
  credentialId: string;

  @ApiProperty({
    description: 'Title or name of the credential',
    example: 'Medical License - Lagos State',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Description of the credential',
    example: 'Valid medical license issued by Lagos State Medical Board',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'File URL or base64 encoded file',
    example: 'https://example.com/credentials/medical-license-updated.pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiProperty({
    description: 'File name',
    example: 'medical-license-updated.pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiProperty({
    description: 'Expiration date (ISO string)',
    example: '2025-12-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsString()
  expirationDate?: string;

  @ApiProperty({
    description: 'Issuing authority',
    example: 'Lagos State Medical Board',
    required: false,
  })
  @IsOptional()
  @IsString()
  issuingAuthority?: string;

  @ApiProperty({
    description: 'Credential number or ID',
    example: 'ML-2024-001234',
    required: false,
  })
  @IsOptional()
  @IsString()
  credentialNumber?: string;
}

export class DeleteCredentialDto {
  @ApiProperty({
    description: 'Array of credential IDs to delete',
    example: ['d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  credentialIds: string[];
}
