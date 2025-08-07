import { BaseEntity } from '../../config/repository/base-entity';
import { Entity, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { ProviderClaim } from './provider-claim.entity';
import { User } from '../../user/entities/user.entity';
import { Claim } from './claim.entity';

@Entity('notes')
export class Note extends BaseEntity {
  @Column({ type: 'text' })
  note: string;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => ProviderClaim, (providerClaim) => providerClaim.notes, {
    nullable: true,
  })
  providerClaim: ProviderClaim;

  @ManyToOne(() => User, (user) => user.notes, {
    nullable: true,
  })
  user: User;

  @ManyToOne(() => Claim, (userClaim) => userClaim.notes, {
    nullable: true,
  })
  userClaim: Claim;
}
