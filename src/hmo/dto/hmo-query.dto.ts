import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsOptional, IsEnum } from 'class-validator';
import { QueryDto } from 'src/config/dto/query.dto';
import { ProcessStatus, Status } from 'src/utils/types';

export class HmoQueryDto {
  @ApiProperty({
    description: 'Admin ID of the user making the request',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  adminId: string;

  @ApiProperty({
    description: 'HMO ID',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  hmoId: string;
}

export class HmosQueryDto extends QueryDto {
  @ApiProperty({
    description: 'admin user ID',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    format: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  adminId: string;

  @ApiProperty({
    description: 'HMO ID',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    format: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  hmoId: string;
}

export class AccountTierQueryDto extends HmoQueryDto {
  @ApiProperty({
    description: 'Account tier ID',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  accountTierId: string;
}

export class HealthcarePlanQueryDto extends HmoQueryDto {
  @ApiProperty({
    description: 'Healthcare plan ID',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  planId: string;
}

export class SimpleHmoQueryDto {
  @ApiProperty({
    description: 'HMO ID',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  hmoId: string;
}

export class HmoListQueryDto extends QueryDto {
  @ApiProperty({
    description: 'Search term for HMO name, email, or address',
    example: 'Premium HMO',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by HMO status',
    enum: ProcessStatus,
    example: ProcessStatus.APPROVED,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProcessStatus)
  status?: ProcessStatus;

  @ApiProperty({
    description: 'Filter by HMO account status',
    enum: Status,
    example: Status.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(Status)
  accountStatus?: Status;

  @ApiProperty({
    description: 'Sort field',
    example: 'name',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    description: 'Sort order',
    example: 'ASC',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}
