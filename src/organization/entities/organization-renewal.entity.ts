import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../config/repository/base-entity';
import { Organization } from './organization.entity';
import { OrganizationPlan } from './organization-plan.entity';
import { ProcessStatus } from '../../utils/types';

@Entity('organization_renewals')
export class OrganizationRenewal extends BaseEntity {
  @ManyToOne(() => Organization, (organization) => organization.renewals)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @ManyToOne(() => OrganizationPlan)
  @JoinColumn({ name: 'plan_id' })
  plan: OrganizationPlan;

  @Column({ type: 'date' })
  renewalDate: Date;

  @Column({ type: 'date' })
  expiryDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  renewalAmount: number;

  @Column({ default: ProcessStatus.PENDING })
  status: ProcessStatus;

  @Column({ type: 'boolean', default: false })
  isAutoRenewal: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
