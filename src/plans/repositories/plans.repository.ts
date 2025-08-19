import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { HealthcarePlan } from '../../hmo/entities/healthcare-plan.entity';
import { PlanSubscription } from '../../hmo/entities/plan-subscription.entity';
import { PlanSearchDto, PlanSubscribersQueryDto } from '../dto/plan-query.dto';

@Injectable()
export class PlansRepository extends TypeOrmRepository<HealthcarePlan> {
  constructor(private readonly dataSource: DataSource) {
    super(HealthcarePlan, dataSource.createEntityManager());
  }

  async findPlansWithFilters(searchDto: PlanSearchDto) {
    const queryBuilder = this.createQueryBuilder('plan')
      .leftJoinAndSelect('plan.hmo', 'hmo')
      .leftJoinAndSelect('plan.accountTiers', 'accountTiers')
      .leftJoinAndSelect('plan.hospitals', 'hospitals')
      .leftJoinAndSelect('plan.paymentOptions', 'paymentOptions');

    // Apply search filters
    if (searchDto.search) {
      queryBuilder.andWhere(
        '(plan.name ILIKE :search OR plan.coverageType ILIKE :search)',
        { search: `%${searchDto.search}%` }
      );
    }

    // Apply status filter
    if (searchDto.status) {
      queryBuilder.andWhere('plan.status = :status', { 
        status: searchDto.status 
      });
    }

    // Apply HMO filter
    if (searchDto.hmoId) {
      queryBuilder.andWhere('hmo.id = :hmoId', { hmoId: searchDto.hmoId });
    }

    // Apply coverage type filter
    if (searchDto.coverageType) {
      queryBuilder.andWhere('plan.coverageType = :coverageType', { 
        coverageType: searchDto.coverageType 
      });
    }

    // Apply pricing structure filter
    if (searchDto.pricingStructure) {
      queryBuilder.andWhere('plan.pricingStructure = :pricingStructure', { 
        pricingStructure: searchDto.pricingStructure 
      });
    }

    // Apply family plan filter
    if (searchDto.familyPlanAvailable !== undefined) {
      queryBuilder.andWhere('plan.familyPlanAvailable = :familyPlanAvailable', { 
        familyPlanAvailable: searchDto.familyPlanAvailable 
      });
    }

    // Apply sorting
    const sortBy = searchDto.sortBy || 'createdAt';
    const sortOrder = searchDto.sortOrder || 'DESC';
    queryBuilder.orderBy(`plan.${sortBy}`, sortOrder);

    // Apply pagination
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    return queryBuilder.getManyAndCount();
  }

  async findPlanById(id: string) {
    return this.createQueryBuilder('plan')
      .leftJoinAndSelect('plan.hmo', 'hmo')
      .leftJoinAndSelect('plan.accountTiers', 'accountTiers')
      .leftJoinAndSelect('plan.hospitals', 'hospitals')
      .leftJoinAndSelect('plan.paymentOptions', 'paymentOptions')
      .leftJoinAndSelect('plan.subscriptions', 'subscriptions')
      .where('plan.id = :id', { id })
      .getOne();
  }

  async findPlanSubscribers(planId: string, queryDto: PlanSubscribersQueryDto) {
    const queryBuilder = this.dataSource
      .createQueryBuilder(PlanSubscription, 'subscription')
      .leftJoinAndSelect('subscription.user', 'user')
      .leftJoinAndSelect('subscription.plan', 'plan')
      .leftJoinAndSelect('subscription.dependents', 'dependents')
      .leftJoinAndSelect('subscription.payment', 'payment')
      .leftJoinAndSelect('subscription.request', 'request')
      .where('plan.id = :planId', { planId });

    // Apply search filters
    if (queryDto.search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR subscription.enrolleeNo ILIKE :search)',
        { search: `%${queryDto.search}%` }
      );
    }

    // Apply status filter
    if (queryDto.status) {
      queryBuilder.andWhere('subscription.status = :status', { 
        status: queryDto.status 
      });
    }

    // Apply sorting
    queryBuilder.orderBy('subscription.createdAt', 'DESC');

    // Apply pagination
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    return queryBuilder.getManyAndCount();
  }

  async getPlanStats() {
    const totalPlans = await this.createQueryBuilder('plan').getCount();

    const activePlans = await this.createQueryBuilder('plan')
      .where('plan.status = :status', { status: 'active' })
      .getCount();

    const familyPlans = await this.createQueryBuilder('plan')
      .where('plan.familyPlanAvailable = :familyPlanAvailable', { familyPlanAvailable: true })
      .getCount();

    const plansByCoverageType = await this.createQueryBuilder('plan')
      .select('plan.coverageType', 'coverageType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('plan.coverageType')
      .getRawMany();

    const plansByPricingStructure = await this.createQueryBuilder('plan')
      .select('plan.pricingStructure', 'pricingStructure')
      .addSelect('COUNT(*)', 'count')
      .groupBy('plan.pricingStructure')
      .getRawMany();

    return {
      totalPlans,
      activePlans,
      inactivePlans: totalPlans - activePlans,
      familyPlans,
      individualPlans: totalPlans - familyPlans,
      plansByCoverageType,
      plansByPricingStructure,
    };
  }

  async getPlanSubscriberStats(planId: string) {
    const totalSubscribers = await this.dataSource
      .createQueryBuilder(PlanSubscription, 'subscription')
      .leftJoin('subscription.plan', 'plan')
      .where('plan.id = :planId', { planId })
      .getCount();

    const activeSubscribers = await this.dataSource
      .createQueryBuilder(PlanSubscription, 'subscription')
      .leftJoin('subscription.plan', 'plan')
      .where('plan.id = :planId', { planId })
      .andWhere('subscription.status = :status', { status: 'active' })
      .getCount();

    const totalDependents = await this.dataSource
      .createQueryBuilder(PlanSubscription, 'subscription')
      .leftJoin('subscription.plan', 'plan')
      .leftJoin('subscription.dependents', 'dependents')
      .where('plan.id = :planId', { planId })
      .getCount();

    return {
      totalSubscribers,
      activeSubscribers,
      inactiveSubscribers: totalSubscribers - activeSubscribers,
      totalDependents,
      averageDependentsPerSubscriber: totalSubscribers > 0 ? totalDependents / totalSubscribers : 0,
    };
  }

  async checkPlanNameExists(name: string, hmoId: string, excludeId?: string) {
    const queryBuilder = this.createQueryBuilder('plan')
      .leftJoin('plan.hmo', 'hmo')
      .where('plan.name = :name', { name })
      .andWhere('hmo.id = :hmoId', { hmoId });

    if (excludeId) {
      queryBuilder.andWhere('plan.id != :excludeId', { excludeId });
    }

    return await queryBuilder.getOne();
  }

  async findPlansByHmo(hmoId: string) {
    return this.createQueryBuilder('plan')
      .leftJoinAndSelect('plan.hmo', 'hmo')
      .leftJoinAndSelect('plan.accountTiers', 'accountTiers')
      .leftJoinAndSelect('plan.hospitals', 'hospitals')
      .where('hmo.id = :hmoId', { hmoId })
      .orderBy('plan.createdAt', 'DESC')
      .getMany();
  }
}
