import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationRepository } from './repositories/organization.repository';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { AssignPlanDto } from './dto/assign-plan.dto';
import { HmoRepository } from '../hmo/repositories/hmo.repository';
import { HealthcarePlanRepository } from '../hmo/repositories/healthcare-plan.repository';
import { OrganizationPlan } from './entities/organization-plan.entity';
import { OrganizationRenewal } from './entities/organization-renewal.entity';
import { EmailService } from '../email/email.service';
import { NotificationService } from '../notification/notification.service';
import { ProcessStatus, Status } from '../utils/types';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly hmoRepository: HmoRepository,
    private readonly healthcarePlanRepository: HealthcarePlanRepository,
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationService,
  ) {}

  async createOrganization(payload: CreateOrganizationDto) {
    try {
      const { hmoId, ...organizationData } = payload;

      const hmo = await this.hmoRepository.findOneBy({ id: hmoId });
      if (!hmo) {
        throw new NotFoundException('HMO not found');
      }

      const organization = await this.organizationRepository.save({
        ...organizationData,
        hmo: { id: hmoId },
      });

      // Send welcome email to organization
      await this.emailService.sendEmail({
        to: organization.contactInfo.email,
        subject: 'Welcome to Our Healthcare Platform',
        html: `
          <h1>Welcome ${organization.name}!</h1>
          <p>Your organization has been successfully registered with our healthcare platform.</p>
          <p>You can now assign healthcare plans to your employees.</p>
        `,
      });

      return {
        success: true,
        message: 'Organization created successfully',
        data: organization,
      };
    } catch (error) {
      throw error;
    }
  }

  async assignPlan(payload: AssignPlanDto) {
    try {
      const {
        organizationId,
        planId,
        startDate,
        endDate,
        pricePerEmployee,
        maxEmployees,
        benefits,
        coverage,
        notes,
      } = payload;

      const organization = await this.organizationRepository.findOneBy({
        id: organizationId,
      });
      if (!organization) {
        throw new NotFoundException('Organization not found');
      }

      const plan = await this.healthcarePlanRepository.findOneBy({
        id: planId,
      });
      if (!plan) {
        throw new NotFoundException('Healthcare plan not found');
      }

      // Create organization plan
      const organizationPlan = await this.organizationRepository.manager.save(
        OrganizationPlan,
        {
          organization: { id: organizationId },
          plan: { id: planId },
          startDate,
          endDate,
          pricePerEmployee,
          maxEmployees,
          benefits,
          coverage,
          notes,
          status: Status.ACTIVE,
        },
      );

      // Create renewal record
      await this.organizationRepository.manager.save(OrganizationRenewal, {
        organization: { id: organizationId },
        plan: { id: organizationPlan.id },
        renewalDate: startDate,
        expiryDate: endDate,
        renewalAmount: pricePerEmployee * maxEmployees,
        status: ProcessStatus.PENDING,
        isAutoRenewal: false,
      });

      // Send notification to organization
      await this.notificationService.create({
        userId: organization.id,
        title: 'New Healthcare Plan Assigned',
        message: `A new healthcare plan has been assigned to your organization.`,
        type: 'PLAN_ASSIGNMENT',
        data: {
          planId: plan.id,
          planName: plan.name,
          startDate,
          endDate,
        },
      });

      return {
        success: true,
        message: 'Healthcare plan assigned successfully',
        data: organizationPlan,
      };
    } catch (error) {
      throw error;
    }
  }

  async getOrganizationsByHmo(hmoId: string) {
    try {
      const organizations =
        await this.organizationRepository.findByHmoId(hmoId);

      return {
        success: true,
        message: 'Organizations retrieved successfully',
        data: organizations,
      };
    } catch (error) {
      throw error;
    }
  }

  async getOrganizationDetails(id: string) {
    try {
      const organization = await this.organizationRepository.findOne({
        where: { id },
        relations: ['plans', 'plans.plan', 'users', 'renewals'],
      });

      if (!organization) {
        throw new NotFoundException('Organization not found');
      }

      return {
        success: true,
        message: 'Organization details retrieved successfully',
        data: organization,
      };
    } catch (error) {
      throw error;
    }
  }

  async getEnrollmentStats(id: string) {
    try {
      const organization = await this.organizationRepository.findOne({
        where: { id },
        relations: ['users'],
      });

      if (!organization) {
        throw new NotFoundException('Organization not found');
      }

      const totalEmployees = organization.employeeCount;
      const enrolledEmployees = organization.enrolledEmployeeCount;
      const enrollmentRate =
        totalEmployees > 0 ? (enrolledEmployees / totalEmployees) * 100 : 0;

      return {
        success: true,
        message: 'Enrollment statistics retrieved successfully',
        data: {
          totalEmployees,
          enrolledEmployees,
          enrollmentRate: `${enrollmentRate.toFixed(2)}%`,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async checkExpiringPlans(daysThreshold: number = 30) {
    try {
      const organizations =
        await this.organizationRepository.findExpiringPlans(daysThreshold);

      // Send notifications for expiring plans
      for (const organization of organizations) {
        for (const plan of organization.plans) {
          await this.notificationService.create({
            userId: organization.id,
            title: 'Plan Expiring Soon',
            message: `Your healthcare plan "${plan.plan.name}" will expire on ${plan.endDate.toLocaleDateString()}.`,
            type: 'PLAN_EXPIRY',
            data: {
              planId: plan.id,
              planName: plan.plan.name,
              expiryDate: plan.endDate,
            },
          });

          await this.emailService.sendEmail({
            to: organization.contactInfo.email,
            subject: 'Healthcare Plan Expiring Soon',
            html: `
              <h1>Plan Expiry Notice</h1>
              <p>Dear ${organization.name},</p>
              <p>Your healthcare plan "${plan.plan.name}" will expire on ${plan.endDate.toLocaleDateString()}.</p>
              <p>Please contact your HMO representative to renew your plan.</p>
            `,
          });
        }
      }

      return {
        success: true,
        message: 'Expiring plans checked successfully',
        data: organizations,
      };
    } catch (error) {
      throw error;
    }
  }
}
