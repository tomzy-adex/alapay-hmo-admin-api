import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { QueryDto } from 'src/config/dto/query.dto';

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
