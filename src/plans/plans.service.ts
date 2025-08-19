import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { PlansRepository } from './repositories/plans.repository';
import { CreatePlanDto } from './dto/create-plan.dto';
import { PlanSearchDto, PlanSubscribersQueryDto } from './dto/plan-query.dto';
import { DataSource, In } from 'typeorm';
import { Hmo } from '../hmo/entities/hmo.entity';
import { AccountTier } from '../hmo/entities/account-tier.entity';
import { Hospital } from '../hmo/entities/hospital.entity';
import { Status } from '../utils/types';

@Injectable()
export class PlansService {
  constructor(
    private readonly plansRepository: PlansRepository,
    private readonly dataSource: DataSource,
  ) {}

  async createPlan(payload: CreatePlanDto) {
    try {
      // Check if plan name already exists for this HMO
      const existingPlan = await this.plansRepository.checkPlanNameExists(
        payload.name,
        payload.hmoId,
      );

      if (existingPlan) {
        throw new ConflictException(
          `A plan with the name "${payload.name}" already exists for this HMO.`,
        );
      }

      // Validate HMO exists
      const hmo = await this.dataSource.getRepository(Hmo).findOne({
        where: { id: payload.hmoId },
      });

      if (!hmo) {
        throw new NotFoundException('HMO not found');
      }

      // Validate account tiers exist and belong to the HMO
      if (payload.accountTierIds && payload.accountTierIds.length > 0) {
        const accountTiers = await this.dataSource.getRepository(AccountTier).find({
          where: { id: In(payload.accountTierIds), hmo: { id: payload.hmoId } },
          relations: ['hmo'],
        });

        if (accountTiers.length !== payload.accountTierIds.length) {
          throw new BadRequestException(
            'Some account tiers not found or do not belong to the specified HMO.',
          );
        }
      }

      // Validate hospitals exist
      if (payload.hospitalIds && payload.hospitalIds.length > 0) {
        const hospitals = await this.dataSource.getRepository(Hospital).find({
          where: { id: In(payload.hospitalIds) },
        });

        if (hospitals.length !== payload.hospitalIds.length) {
          throw new BadRequestException('Some hospitals not found.');
        }
      }

      // Create the plan
      const plan = this.plansRepository.create({
        name: payload.name,
        coverageType: payload.coverageType,
        pricingStructure: payload.pricingStructure,
        familyPlanAvailable: payload.familyPlanAvailable || false,
        dependentDiscountRate: payload.dependentDiscountRate,
        maxDependents: payload.maxDependents,
        planBenefits: payload.planBenefits,
        status: payload.status || Status.DORMANT,
        minimumUsersRequired: payload.minimumUsersRequired,
        minimumPremiumRequired: payload.minimumPremiumRequired,
        hmo: { id: payload.hmoId },
        accountTiers: payload.accountTierIds?.map(id => ({ id })),
        hospitals: payload.hospitalIds?.map(id => ({ id })),
      });

      const createdPlan = await this.plansRepository.save(plan);

      // Fetch the created plan with relations
      const planWithRelations = await this.plansRepository.findPlanById(createdPlan.id);

      return {
        success: true,
        message: 'Healthcare plan created successfully',
        data: this.sanitizePlanData(planWithRelations),
      };
    } catch (error) {
      if (error instanceof ConflictException || 
          error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error creating plan:', error);
      throw new InternalServerErrorException('Failed to create healthcare plan');
    }
  }

  async getAllPlans(searchDto: PlanSearchDto) {
    try {
      const [plans, total] = await this.plansRepository.findPlansWithFilters(searchDto);

      const page = searchDto.page || 1;
      const limit = searchDto.limit || 10;
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Plans retrieved successfully',
        data: {
          plans: plans.map(plan => this.sanitizePlanData(plan)),
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      };
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw new InternalServerErrorException('Failed to fetch plans');
    }
  }

  async getPlanById(id: string) {
    try {
      const plan = await this.plansRepository.findPlanById(id);

      if (!plan) {
        throw new NotFoundException('Plan not found');
      }

      return {
        success: true,
        message: 'Plan retrieved successfully',
        data: this.sanitizePlanData(plan, true), // Include subscriptions for individual view
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching plan by ID:', error);
      throw new InternalServerErrorException('Failed to fetch plan');
    }
  }

  async deletePlan(id: string) {
    try {
      const plan = await this.plansRepository.findPlanById(id);

      if (!plan) {
        throw new NotFoundException('Plan not found');
      }

      // Check if plan has active subscriptions
      const hasActiveSubscriptions = plan.subscriptions && 
        plan.subscriptions.some(sub => sub.status === Status.ACTIVE);

      if (hasActiveSubscriptions) {
        throw new BadRequestException(
          'Cannot delete plan with active subscriptions. Please deactivate all subscriptions first.',
        );
      }

      // Soft delete the plan
      await this.plansRepository.softDelete(id);

      return {
        success: true,
        message: 'Plan deleted successfully',
        data: {
          id: plan.id,
          name: plan.name,
          deletedAt: new Date(),
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error deleting plan:', error);
      throw new InternalServerErrorException('Failed to delete plan');
    }
  }

  async getPlanSubscribers(planId: string, queryDto: PlanSubscribersQueryDto) {
    try {
      // Verify plan exists
      const plan = await this.plansRepository.findOne({ where: { id: planId } });
      if (!plan) {
        throw new NotFoundException('Plan not found');
      }

      const [subscribers, total] = await this.plansRepository.findPlanSubscribers(
        planId,
        queryDto,
      );

      const page = queryDto.page || 1;
      const limit = queryDto.limit || 10;
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Plan subscribers retrieved successfully',
        data: {
          plan: {
            id: plan.id,
            name: plan.name,
            coverageType: plan.coverageType,
          },
          subscribers: subscribers.map(subscriber => this.sanitizeSubscriberData(subscriber)),
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching plan subscribers:', error);
      throw new InternalServerErrorException('Failed to fetch plan subscribers');
    }
  }

  async getPlanStats() {
    try {
      const stats = await this.plansRepository.getPlanStats();

      return {
        success: true,
        message: 'Plan statistics retrieved successfully',
        data: stats,
      };
    } catch (error) {
      console.error('Error fetching plan stats:', error);
      throw new InternalServerErrorException('Failed to fetch plan statistics');
    }
  }

  async getPlanSubscriberStats(planId: string) {
    try {
      // Verify plan exists
      const plan = await this.plansRepository.findOne({ where: { id: planId } });
      if (!plan) {
        throw new NotFoundException('Plan not found');
      }

      const stats = await this.plansRepository.getPlanSubscriberStats(planId);

      return {
        success: true,
        message: 'Plan subscriber statistics retrieved successfully',
        data: {
          plan: {
            id: plan.id,
            name: plan.name,
          },
          ...stats,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching plan subscriber stats:', error);
      throw new InternalServerErrorException('Failed to fetch plan subscriber statistics');
    }
  }

  async getPlansByHmo(hmoId: string) {
    try {
      const plans = await this.plansRepository.findPlansByHmo(hmoId);

      return {
        success: true,
        message: 'HMO plans retrieved successfully',
        data: {
          hmoId,
          plans: plans.map(plan => this.sanitizePlanData(plan)),
        },
      };
    } catch (error) {
      console.error('Error fetching HMO plans:', error);
      throw new InternalServerErrorException('Failed to fetch HMO plans');
    }
  }

  private sanitizePlanData(plan: any, includeSubscriptions = false) {
    const sanitized = {
      id: plan.id,
      name: plan.name,
      coverageType: plan.coverageType,
      pricingStructure: plan.pricingStructure,
      familyPlanAvailable: plan.familyPlanAvailable,
      dependentDiscountRate: plan.dependentDiscountRate,
      maxDependents: plan.maxDependents,
      planBenefits: plan.planBenefits,
      status: plan.status,
      minimumUsersRequired: plan.minimumUsersRequired,
      minimumPremiumRequired: plan.minimumPremiumRequired,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      hmo: plan.hmo ? {
        id: plan.hmo.id,
        name: plan.hmo.name,
        email: plan.hmo.email,
        phoneNumber: plan.hmo.phoneNumber,
      } : null,
      accountTiers: plan.accountTiers ? plan.accountTiers.map(tier => ({
        id: tier.id,
        name: tier.name,
        premium: tier.premium,
        coverageDetails: tier.coverageDetails,
      })) : [],
      hospitals: plan.hospitals ? plan.hospitals.map(hospital => ({
        id: hospital.id,
        name: hospital.name,
        address: hospital.address,
        phone: hospital.phone,
        email: hospital.email,
      })) : [],
      paymentOptions: plan.paymentOptions ? plan.paymentOptions.map(option => ({
        id: option.id,
        name: option.name,
        duration: option.duration,
      })) : [],
    };

    // Include subscriptions only for individual plan view
    if (includeSubscriptions && plan.subscriptions) {
      // sanitized.subscriptions = plan.subscriptions.map(subscription => ({
      //   id: subscription.id,
      //   startDate: subscription.startDate,
      //   endDate: subscription.endDate,
      //   status: subscription.status,
      //   createdAt: subscription.createdAt,
      // }));
    }

    return sanitized;
  }

  private sanitizeSubscriberData(subscriber: any) {
    return {
      id: subscriber.id,
      name: subscriber.name,
      status: subscriber.status,
      enrolleeNo: subscriber.enrolleeNo,
      switchActivationDate: subscriber.switchActivationDate,
      createdAt: subscriber.createdAt,
      updatedAt: subscriber.updatedAt,
      user: subscriber.user ? {
        id: subscriber.user.id,
        firstName: subscriber.user.firstName,
        lastName: subscriber.user.lastName,
        email: subscriber.user.email,
        phoneNumber: subscriber.user.phoneNumber,
      } : null,
      dependents: subscriber.dependents ? subscriber.dependents.map(dependent => ({
        id: dependent.id,
        firstName: dependent.firstName,
        lastName: dependent.lastName,
        dob: dependent.dob,
        relationship: dependent.relationship,
        enrolleeNo: dependent.enrolleeNo,
      })) : [],
      payment: subscriber.payment ? {
        id: subscriber.payment.id,
        amount: subscriber.payment.amount,
        status: subscriber.payment.status,
        type: subscriber.payment.type,
      } : null,
      request: subscriber.request ? subscriber.request.map(req => ({
        id: req.id,
        status: req.status,
        createdAt: req.createdAt,
      })) : [],
    };
  }
}
