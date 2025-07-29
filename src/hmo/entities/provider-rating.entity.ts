import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Hospital } from './hospital.entity';
import { BaseEntity } from 'src/config/repository/base-entity';

@Entity('provider_ratings')
export class ProviderRating extends BaseEntity {
  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  review: string;

  @ManyToOne(() => Hospital, (provider) => provider.ratings)
  @JoinColumn({ name: 'provider_id' })
  provider: Hospital;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'jsonb', nullable: true })
  metrics: {
    waitTime?: number;
    cleanliness?: number;
    staffFriendliness?: number;
    treatmentEffectiveness?: number;
  };
}
