import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { OrganizationRepository } from './repositories/organization.repository';
import { Organization } from './entities/organization.entity';
import { OrganizationPlan } from './entities/organization-plan.entity';
import { OrganizationRenewal } from './entities/organization-renewal.entity';
import { HmoModule } from '../hmo/hmo.module';
import { EmailModule } from '../email/email.module';
import { NotificationModule } from '../notification/notification.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization,
      OrganizationPlan,
      OrganizationRenewal,
    ]),
    HmoModule,
    EmailModule,
    NotificationModule,
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService, OrganizationRepository],
  exports: [OrganizationService, OrganizationRepository],
})
export class OrganizationModule {}
