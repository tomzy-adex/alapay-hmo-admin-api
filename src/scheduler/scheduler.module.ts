import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RenewalCheckTask } from './tasks/renewal-check.task';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [ScheduleModule.forRoot(), OrganizationModule],
  providers: [RenewalCheckTask],
})
export class SchedulerModule {}
