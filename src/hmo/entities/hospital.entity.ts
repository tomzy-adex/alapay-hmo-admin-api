import { BaseEntity } from '../../config/repository/base-entity';
import { Entity, Column, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { HealthcarePlan } from './healthcare-plan.entity';
import { User } from '../../user/entities/user.entity';
import { Hmo } from './hmo.entity';
import { ProviderEnrollment } from './provider-enrollment.entity';
import { ProviderRating } from './provider-rating.entity';
import { ProviderService } from './provider-service.entity';
import { ProviderClaim } from 'src/claim/entities/provider-claim.entity';
import { ProcessStatus, Status } from 'src/utils/types';

@Entity('hospitals')
export class Hospital extends BaseEntity {
  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column({ default: ProcessStatus.PENDING })
  status: ProcessStatus;

  @Column({ default: Status.DORMANT })
  accountStatus: Status;

  @Column({ nullable: true })
  verificationComments: string;

  @Column({ default: false })
  emergencyServiceProvider: boolean;

  @ManyToMany(() => HealthcarePlan, (plan) => plan.hospitals)
  @JoinTable() // Defines the owner side of the relationship and creates the junction table
  plans: HealthcarePlan[];

  @ManyToMany(() => User, (users) => users.hospitals)
  users: User[];

  @ManyToMany(() => Hmo, (hmo) => hmo.hospitals)
  hmos: Hmo[];

  @OneToMany(() => ProviderEnrollment, (enrollment) => enrollment.provider)
  enrollments: ProviderEnrollment[];

  @OneToMany(() => ProviderRating, (ratings) => ratings.provider)
  ratings: ProviderRating[];

  @OneToMany(() => ProviderService, (services) => services.provider)
  services: ProviderService[];

  @OneToMany(() => ProviderClaim, (providerClaims) => providerClaims.hospital)
  providerClaims: ProviderClaim[];
}
