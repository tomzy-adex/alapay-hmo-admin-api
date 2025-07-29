import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Hmo } from './hmo.entity';
import { Hospital } from './hospital.entity';
import { BaseEntity } from 'src/config/repository/base-entity';

@Entity('provider_enrollments')
export class ProviderEnrollment extends BaseEntity {
  @ManyToOne(() => Hospital, (provider) => provider.enrollments)
  @JoinColumn({ name: 'provider_id' })
  provider: Hospital;

  @ManyToOne(() => Hmo)
  @JoinColumn({ name: 'hmo_id' })
  hmo: Hmo;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'pending'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  terms: {
    paymentTerms: string;
    serviceAgreement: string;
    specialConditions?: string[];
  };
}
