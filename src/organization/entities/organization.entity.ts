import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../config/repository/base-entity';
import { Hmo } from '../../hmo/entities/hmo.entity';
import { User } from '../../user/entities/user.entity';
import { ProcessStatus, Status } from '../../utils/types';
import { OrganizationPlan } from './organization-plan.entity';
import { OrganizationRenewal } from './organization-renewal.entity';

@Entity('organizations')
export class Organization extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  contactInfo: {
    email: string;
    phone: string;
    address: string;
    website?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  businessInfo: {
    registrationNumber: string;
    taxId: string;
    industry: string;
    size: string;
  };

  @Column({ default: ProcessStatus.PENDING })
  status: ProcessStatus;

  @Column({ default: Status.ACTIVE })
  accountStatus: Status;

  @Column({ type: 'int', default: 0 })
  employeeCount: number;

  @Column({ type: 'int', default: 0 })
  enrolledEmployeeCount: number;

  @ManyToOne(() => Hmo, (hmo) => hmo.organizations)
  @JoinColumn({ name: 'hmo_id' })
  hmo: Hmo;

  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @OneToMany(() => OrganizationPlan, (plan) => plan.organization)
  plans: OrganizationPlan[];

  @OneToMany(() => OrganizationRenewal, (renewal) => renewal.organization)
  renewals: OrganizationRenewal[];
}
