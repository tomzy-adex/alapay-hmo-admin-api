import { PartialType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsUUID } from 'class-validator';
import { PaymentDuration, PaymentOptionType } from 'src/utils/types';

export class PaymentOptionDto {
  @ApiProperty({
    enum: PaymentOptionType,
    description: 'Type of payment option',
    example: PaymentOptionType.MONTHLY,
    enumName: 'PaymentOptionType',
  })
  @IsEnum(PaymentOptionType)
  @IsNotEmpty()
  name: PaymentOptionType;

  @ApiProperty({
    enum: PaymentDuration,
    description: 'Duration of the payment option in days',
    example: PaymentDuration.MONTHLY,
    enumName: 'PaymentDuration',
  })
  @IsEnum(PaymentDuration)
  @IsNotEmpty()
  duration: PaymentDuration;
}

export class UpdatePaymentOptionDto extends PartialType(PaymentOptionDto) {
  @ApiProperty({
    description: 'UUID of the payment option to update',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
