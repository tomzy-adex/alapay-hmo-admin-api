import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreatmentClaimsController } from './treatment-claims.controller';
import { TreatmentClaimsService } from './treatment-claims.service';
import { TreatmentClaimsRepository } from './repositories/treatment-claims.repository';
import { Claim } from '../claim/entities/claim.entity';
import { ProviderClaim } from '../claim/entities/provider-claim.entity';
import { User } from '../user/entities/user.entity';
import { HealthcarePlan } from '../hmo/entities/healthcare-plan.entity';
import { Hospital } from '../hmo/entities/hospital.entity';
import { Hmo } from '../hmo/entities/hmo.entity';
import { ClaimPayment } from '../payment/entities/claim-payment.entity';
import { PreAuthRequest } from '../hmo/entities/pre-auth-request.entity';
import { Note } from '../claim/entities/note.entity';
import { Notification } from '../notification/entities/notification.entity';
import { AuditLog } from '../audit-log/entities/audit-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Claim,
      ProviderClaim,
      User,
      HealthcarePlan,
      Hospital,
      Hmo,
      ClaimPayment,
      PreAuthRequest,
      Note,
      Notification,
      AuditLog,
    ]),
  ],
  controllers: [TreatmentClaimsController],
  providers: [TreatmentClaimsService, TreatmentClaimsRepository],
  exports: [TreatmentClaimsService, TreatmentClaimsRepository],
})
export class TreatmentClaimsModule {}
