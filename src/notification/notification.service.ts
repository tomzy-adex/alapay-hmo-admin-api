import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationStatus } from '../utils/types';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(data: {
    userId: string;
    title: string;
    message: string;
    type: string;
    data?: Record<string, any>;
  }): Promise<Notification> {
    const notification = this.notificationRepository.create({
      user: { id: data.userId },
      title: data.title,
      message: data.message,
      type: data.type,
      metadata: data.data,
      status: NotificationStatus.UNREAD,
    });
    return this.notificationRepository.save(notification);
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: {
        user: { id: userId },
        status: NotificationStatus.UNREAD,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.status = NotificationStatus.READ;
    return this.notificationRepository.save(notification);
  }
}
