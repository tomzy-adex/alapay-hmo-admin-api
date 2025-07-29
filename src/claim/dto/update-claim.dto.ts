import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateClaimDto } from './create-claim.dto';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ClaimStatus } from 'src/utils/types';

export class UpdateClaimDto extends PartialType(CreateClaimDto) {}

export class UpdateClaimStatusDto {
  @ApiProperty({
    description: 'Status of the claim',
    enum: ClaimStatus,
    example: ClaimStatus.APPROVED,
  })
  @IsEnum(ClaimStatus)
  @IsNotEmpty()
  status: ClaimStatus;

  @ApiProperty({
    description: 'Reason for the status change',
    example: 'Claim approved after review',
  })
  @IsOptional()
  reason?: string;
}

export class ClaimQueryDto {
  @ApiProperty({
    description: 'Claim ID',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
  })
  @IsUUID()
  @IsNotEmpty()
  claimId: string;

  @ApiProperty({
    description: 'User ID',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
