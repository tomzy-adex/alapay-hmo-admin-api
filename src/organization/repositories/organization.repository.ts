import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { Organization } from '../entities/organization.entity';

@Injectable()
export class OrganizationRepository extends TypeOrmRepository<Organization> {
  constructor(private readonly dataSource: DataSource) {
    super(Organization, dataSource.createEntityManager());
  }

  async findWithPlans(id: string) {
    return this.findOne({
      where: { id },
      relations: ['plans', 'plans.plan'],
    });
  }

  async findWithUsers(id: string) {
    return this.findOne({
      where: { id },
      relations: ['users'],
    });
  }

  async findWithRenewals(id: string) {
    return this.findOne({
      where: { id },
      relations: ['renewals', 'renewals.plan'],
    });
  }

  async findByHmoId(hmoId: string) {
    return this.find({
      where: { hmo: { id: hmoId } },
      relations: ['plans', 'plans.plan'],
    });
  }

  async findExpiringPlans(daysThreshold: number) {
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);

    return this.createQueryBuilder('organization')
      .innerJoinAndSelect('organization.plans', 'plan')
      .where('plan.endDate <= :thresholdDate', { thresholdDate })
      .andWhere('plan.status = :status', { status: 'ACTIVE' })
      .getMany();
  }
}
