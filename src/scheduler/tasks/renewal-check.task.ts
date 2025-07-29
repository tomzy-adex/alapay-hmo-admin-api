import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrganizationService } from '../../organization/organization.service';

@Injectable()
export class RenewalCheckTask {
  private readonly logger = new Logger(RenewalCheckTask.name);

  constructor(private readonly organizationService: OrganizationService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleRenewalCheck() {
    this.logger.log('Running daily renewal check task');
    try {
      // Check for plans expiring in the next 30 days
      const result = await this.organizationService.checkExpiringPlans(30);
      this.logger.log(`Renewal check completed: ${result.message}`);
    } catch (error) {
      this.logger.error('Error in renewal check task', error);
    }
  }
} 