import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Status } from '../../utils/types';
import { QueryDto } from '../../config/dto/query.dto';

export class EnrollmentQueryDto extends QueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsString()
  planType?: string;
}
