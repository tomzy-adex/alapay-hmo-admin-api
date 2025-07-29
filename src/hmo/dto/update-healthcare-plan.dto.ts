import { PartialType } from '@nestjs/mapped-types';
import { CreateHealthcarePlanDto } from './create-healthcare-plan.dto';

export class UpdateHealthcarePlanDto extends PartialType(
  CreateHealthcarePlanDto,
) {}
