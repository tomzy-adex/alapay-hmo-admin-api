import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateHcpDto } from './create-hcp.dto';

export class UpdateHcpDto extends PartialType(CreateHcpDto) {
  @ApiProperty({
    description: 'ID of the healthcare provider to update',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    format: 'uuid',
  })
  id: string;
}
