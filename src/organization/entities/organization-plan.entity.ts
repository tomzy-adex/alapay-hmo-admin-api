import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../config/repository/base-entity';
import { Organization } from './organization.entity';
import { HealthcarePlan } from '../../hmo/entities/healthcare-plan.entity';
import { Status } from '../../utils/types';

@Entity('organization_plans')
export class OrganizationPlan extends BaseEntity {
  @ManyToOne(() => Organization, (organization) => organization.plans)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @ManyToOne(() => HealthcarePlan)
  @JoinColumn({ name: 'plan_id' })
  plan: HealthcarePlan;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerEmployee: number;

  @Column({ type: 'int' })
  maxEmployees: number;

  @Column({ type: 'jsonb', nullable: true })
  benefits: {
    name: string;
    description: string;
    limit?: number;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  coverage: {
    service: string;
    percentage: number;
    limit?: number;
  }[];

  @Column({ default: Status.ACTIVE })
  status: Status;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
