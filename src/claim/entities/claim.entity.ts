import { Hospital } from 'src/hmo/entities/hospital.entity';
import { BaseEntity } from '../../config/repository/base-entity';
import { HealthcarePlan } from '../../hmo/entities/healthcare-plan.entity';
import { User } from '../../user/entities/user.entity';
import { ClaimStatus, ClaimType } from '../../utils/types';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Note } from './note.entity';

@Entity('claims')
export class Claim extends BaseEntity {
  @Column()
  details: string;

  @Column({ type: 'json', nullable: true })
  documents: Record<string, any>;

  @ManyToOne(() => User, (user) => user.claims)
  user: User;

  @ManyToOne(() => HealthcarePlan, (plan) => plan.hospitals)
  plan: HealthcarePlan;

  @Column({
    type: 'enum',
    enum: ClaimType,
    default: ClaimType.MEDICAL,
  })
  type: ClaimType;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ManyToOne(() => Hospital)
  hospital: Hospital;

  @Column({ type: 'date' })
  serviceDate: Date;

  @OneToMany(() => Note, (notes) => notes.userClaim, {
    cascade: true,
  })
  notes: Note[];

  @Column({ nullable: true })
  providerReference: string;

  @Column({
    type: 'enum',
    enum: ClaimStatus,
    default: ClaimStatus.PENDING,
  })
  status: ClaimStatus;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
