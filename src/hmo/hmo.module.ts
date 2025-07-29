import { Global, Module } from '@nestjs/common';
import { HmoController } from './hmo.controller';
import { HmoService } from './hmo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountTier } from './entities/account-tier.entity';
import { HealthcarePlan } from './entities/healthcare-plan.entity';
import { Hmo } from './entities/hmo.entity';
import { Hospital } from './entities/hospital.entity';
import { PlanSubscription } from './entities/plan-subscription.entity';
import { PlanSubscriptionRepository } from './repositories/plan-subscription.repository';
import { HealthcarePlanRepository } from './repositories/healthcare-plan.repository';
import { HmoRepository } from './repositories/hmo.repository';
import { HospitalRepository } from './repositories/hospital.repository';
import { DependentRepository } from './repositories/dependent.repository';
import { Dependent } from './entities/dependent.entity';
import { PreAuthRequest } from './entities/pre-auth-request.entity';
import { PreAuthRequestRepository } from './repositories/pre-auth-request.repository';
import { AccountTierRepository } from './repositories/account-tier.repository';
import { HospitalService } from './hospital.service';
import { ProviderEnrollment } from './entities/provider-enrollment.entity';
import { ProviderRating } from './entities/provider-rating.entity';
import { ProviderService } from './entities/provider-service.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccountTier,
      HealthcarePlan,
      Hmo,
      Hospital,
      PlanSubscription,
      Dependent,
      PreAuthRequest,
      ProviderEnrollment,
      ProviderRating,
      ProviderService,
    ]),
  ],
  controllers: [HmoController],
  providers: [
    HmoService,
    PlanSubscriptionRepository,
    HealthcarePlanRepository,
    HmoRepository,
    HospitalRepository,
    DependentRepository,
    PreAuthRequestRepository,
    AccountTierRepository,
    HospitalService,
  ],
  exports: [
    HmoService,
    PlanSubscriptionRepository,
    HealthcarePlanRepository,
    HmoRepository,
    HospitalRepository,
    DependentRepository,
    PreAuthRequestRepository,
    AccountTierRepository,
    HospitalService,
  ],
})
export class HmoModule {}
