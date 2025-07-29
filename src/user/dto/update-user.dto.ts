import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ProcessStatus } from 'src/utils/types';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: 'UUID of the user to update',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    format: 'uuid',
  })
  id: string;
}

export class AccountApprovalDto {
  @ApiProperty({ enumName: 'Status', enum: ProcessStatus })
  @IsEnum(ProcessStatus)
  @IsNotEmpty()
  status: ProcessStatus;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;
}
