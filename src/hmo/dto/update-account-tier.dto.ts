import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountTierDto } from './create-account-tier.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAccountTierDto extends PartialType(CreateAccountTierDto) {
  @ApiProperty({ description: 'The name of the account tier', required: false })
  name?: string;

  @ApiProperty({
    description: 'The description of the account tier',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'The status of the account tier',
    required: false,
  })
  status?: boolean;
}
