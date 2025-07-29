import { NotificationStatus } from '../../utils/types';
import { BaseEntity } from '../../config/repository/base-entity';
import { User } from '../../user/entities/user.entity';
import { Entity, Column, ManyToOne } from 'typeorm';
import { Hmo } from '../../hmo/entities/hmo.entity';

@Entity('notifications')
export class Notification extends BaseEntity {
  @Column()
  title: string;

  @Column()
  message: string;

  @Column()
  type: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ default: NotificationStatus.UNREAD })
  status: NotificationStatus;

  @ManyToOne(() => User, (user) => user.notifications)
  user: User;

  @ManyToOne(() => Hmo, (hmo) => hmo.notifications)
  hmo: Hmo;
}
