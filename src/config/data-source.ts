import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from '.';
import { Role } from '../role/entities/role.entity';
import { User } from '../user/entities/user.entity';
import { Hmo } from '../hmo/entities/hmo.entity';
import { Claim } from '../claim/entities/claim.entity';
import { Notification } from '../notification/entities/notification.entity';
import { Payment } from '../payment/entities/payment.entity';
import { HealthcarePlan } from '../hmo/entities/healthcare-plan.entity';
import { Hospital } from '../hmo/entities/hospital.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { AuditLog } from '../audit-log/entities/audit-log.entity';
import { AccountTier } from '../hmo/entities/account-tier.entity';
import { PaymentOption } from '../payment/entities/payment-option.entity';
import { PlanSubscription } from '../hmo/entities/plan-subscription.entity';
import { Dependent } from '../hmo/entities/dependent.entity';
import { PreAuthRequest } from '../hmo/entities/pre-auth-request.entity';
import { Transaction } from '../payment/entities/transaction.entity';
import { ProviderEnrollment } from 'src/hmo/entities/provider-enrollment.entity';
import { ProviderRating } from 'src/hmo/entities/provider-rating.entity';
import { ProviderService } from 'src/hmo/entities/provider-service.entity';
import { OrganizationPlan } from 'src/organization/entities/organization-plan.entity';
import { OrganizationRenewal } from 'src/organization/entities/organization-renewal.entity';
import { Organization } from 'src/organization/entities/organization.entity';
import { ProviderClaim } from 'src/claim/entities/provider-claim.entity';
import { Note } from 'src/claim/entities/note.entity';
import { ClaimPayment } from 'src/payment/entities/claim-payment.entity';

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  url: config.db.url,
  migrations: ['dist/db/migrations/*.js'],
  ssl: config.env === 'development' ? false : { rejectUnauthorized: false },
  entities: [
    Role,
    User,
    Hmo,
    AccountTier,
    Claim,
    Notification,
    Payment,
    PaymentOption,
    PlanSubscription,
    HealthcarePlan,
    Hospital,
    Wallet,
    AuditLog,
    Dependent,
    PreAuthRequest,
    Transaction,
    ProviderEnrollment,
    ProviderRating,
    ProviderService,
    Organization,
    OrganizationPlan,
    OrganizationRenewal,
    ProviderClaim,
    Note,
    ClaimPayment,
  ],
  subscribers: [],
  logging: false,
};

export const dataSource = new DataSource(typeOrmConfig);
