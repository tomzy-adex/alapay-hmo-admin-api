import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { HmoModule } from './hmo/hmo.module';
import { WalletModule } from './wallet/wallet.module';
import { ClaimModule } from './claim/claim.module';
import { PaymentModule } from './payment/payment.module';
import { NotificationModule } from './notification/notification.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/data-source';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from './cache/cache.module';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationModule } from './organization/organization.module';
import { CustomerModule } from './customer/customer.module';
import { PlansModule } from './plans/plans.module';
import { HealthcareProvidersModule } from './healthcare-providers/healthcare-providers.module';
import { TransactionsModule } from './transactions/transactions.module';
import { TreatmentClaimsModule } from './treatment-claims/treatment-claims.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config globally available
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 10,
      },
    ]),
    UserModule.register(),
    RoleModule,
    AuditLogModule,
    HmoModule,
    WalletModule,
    ClaimModule,
    PaymentModule,
    NotificationModule,
    CacheModule.register(),
    EmailModule.register(),
    AuthModule.register(),
    OrganizationModule,
    CustomerModule,
    PlansModule,
    HealthcareProvidersModule,
    TransactionsModule,
    TreatmentClaimsModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
