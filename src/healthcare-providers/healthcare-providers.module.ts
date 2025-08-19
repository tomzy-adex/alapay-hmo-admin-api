import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthcareProvidersController } from './healthcare-providers.controller';
import { HealthcareProvidersService } from './healthcare-providers.service';
import { HealthcareProvidersRepository } from './repositories/healthcare-providers.repository';
import { Hospital } from '../hmo/entities/hospital.entity';
import { Hmo } from '../hmo/entities/hmo.entity';
import { HealthcarePlan } from '../hmo/entities/healthcare-plan.entity';
import { ProviderEnrollment } from '../hmo/entities/provider-enrollment.entity';
import { ProviderRating } from '../hmo/entities/provider-rating.entity';
import { ProviderService } from '../hmo/entities/provider-service.entity';
import { ProviderClaim } from '../claim/entities/provider-claim.entity';
import { User } from '../user/entities/user.entity';
import { Notification } from '../notification/entities/notification.entity';
import { AuditLog } from '../audit-log/entities/audit-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Hospital,
      Hmo,
      HealthcarePlan,
      ProviderEnrollment,
      ProviderRating,
      ProviderService,
      ProviderClaim,
      User,
      Notification,
      AuditLog,
    ]),
  ],
  controllers: [HealthcareProvidersController],
  providers: [HealthcareProvidersService, HealthcareProvidersRepository],
  exports: [HealthcareProvidersService, HealthcareProvidersRepository],
})
export class HealthcareProvidersModule {}
