import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Hospital } from './hospital.entity';
import { BaseEntity } from 'src/config/repository/base-entity';

@Entity('provider_services')
export class ProviderService extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  basePrice: number;

  @Column({ type: 'jsonb', nullable: true })
  coverageDetails: {
    isCovered: boolean;
    coveragePercentage?: number;
    limitations?: string[];
  };

  @ManyToOne(() => Hospital, (provider) => provider.services)
  @JoinColumn({ name: 'provider_id' })
  provider: Hospital;
}
