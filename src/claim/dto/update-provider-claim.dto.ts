import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ProcessStatus } from 'src/utils/types';

export class UpdateProviderClaimStatusDto {
  @ApiProperty({
    description: 'Status of the claim',
    enum: ProcessStatus,
    example: ProcessStatus.APPROVED,
  })
  @IsEnum(ProcessStatus)
  @IsNotEmpty()
  status: ProcessStatus;

  @ApiProperty({
    description: 'Reason for the status change',
    example: 'Claim approved after review',
  })
  @IsOptional()
  reason?: string;
}
