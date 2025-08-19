import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ClaimStatus } from '../../utils/types';

export class ApproveDeclineClaimDto {
  @ApiProperty({
    description: 'Action to perform on the claim',
    enum: ['approve', 'decline'],
    example: 'approve',
  })
  @IsNotEmpty()
  @IsString()
  action: 'approve' | 'decline';

  @ApiProperty({
    description: 'Reason for approval or rejection',
    example: 'Claim approved after review of medical documents',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({
    description: 'Approved amount (if different from claimed amount)',
    example: 45000.00,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  approvedAmount?: number;

  @ApiProperty({
    description: 'Additional notes or comments',
    example: 'Partial approval due to some services not covered',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'New status for the claim',
    enum: ClaimStatus,
    example: ClaimStatus.APPROVED,
    required: false,
  })
  @IsOptional()
  @IsEnum(ClaimStatus)
  status?: ClaimStatus;
}
