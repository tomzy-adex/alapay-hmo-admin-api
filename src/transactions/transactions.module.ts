import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TransactionsRepository } from './repositories/transactions.repository';
import { Transaction } from '../payment/entities/transaction.entity';
import { Payment } from '../payment/entities/payment.entity';
import { User } from '../user/entities/user.entity';
import { PlanSubscription } from '../hmo/entities/plan-subscription.entity';
import { HealthcarePlan } from '../hmo/entities/healthcare-plan.entity';
import { PaymentOption } from '../payment/entities/payment-option.entity';
import { ClaimPayment } from '../payment/entities/claim-payment.entity';
import { ProviderClaim } from '../claim/entities/provider-claim.entity';
import { Hmo } from '../hmo/entities/hmo.entity';
import { Hospital } from '../hmo/entities/hospital.entity';
import { Notification } from '../notification/entities/notification.entity';
import { AuditLog } from '../audit-log/entities/audit-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      Payment,
      User,
      PlanSubscription,
      HealthcarePlan,
      PaymentOption,
      ClaimPayment,
      ProviderClaim,
      Hmo,
      Hospital,
      Notification,
      AuditLog,
    ]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionsRepository],
  exports: [TransactionsService, TransactionsRepository],
})
export class TransactionsModule {}
