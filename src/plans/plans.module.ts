import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { PlansRepository } from './repositories/plans.repository';
import { HealthcarePlan } from '../hmo/entities/healthcare-plan.entity';
import { PlanSubscription } from '../hmo/entities/plan-subscription.entity';
import { Hmo } from '../hmo/entities/hmo.entity';
import { AccountTier } from '../hmo/entities/account-tier.entity';
import { Hospital } from '../hmo/entities/hospital.entity';
import { PaymentOption } from '../payment/entities/payment-option.entity';
import { User } from '../user/entities/user.entity';
import { Dependent } from '../hmo/entities/dependent.entity';
import { PreAuthRequest } from '../hmo/entities/pre-auth-request.entity';
import { Payment } from '../payment/entities/payment.entity';
import { Notification } from '../notification/entities/notification.entity';
import { AuditLog } from '../audit-log/entities/audit-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HealthcarePlan,
      PlanSubscription,
      Hmo,
      AccountTier,
      Hospital,
      PaymentOption,
      User,
      Dependent,
      PreAuthRequest,
      Payment,
      Notification,
      AuditLog,
    ]),
  ],
  controllers: [PlansController],
  providers: [PlansService, PlansRepository],
  exports: [PlansService, PlansRepository],
})
export class PlansModule {}
