import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationMessage } from '../entities/organization-message.entity';
import { OrganizationRepository } from '../../organization/repositories/organization.repository';
import { NotificationService } from '../../notification/notification.service';
import { EmailService } from '../../email/email.service';

@Injectable()
export class OrganizationMessagingService {
  constructor(
    @InjectRepository(OrganizationMessage)
    private readonly messageRepository: Repository<OrganizationMessage>,
    private readonly organizationRepository: OrganizationRepository,
    private readonly notificationService: NotificationService,
    private readonly emailService: EmailService,
  ) {}

  async sendMessage(
    organizationId: string,
    subject: string,
    message: string,
    senderId: string,
  ) {
    try {
      const organization = await this.organizationRepository.findOneBy({
        id: organizationId,
      });
      if (!organization) {
        throw new NotFoundException('Organization not found');
      }

      // Save message to database
      const savedMessage = await this.messageRepository.save({
        organization: { id: organizationId },
        subject,
        message,
        sender: { id: senderId },
      });

      // Create in-app notification
      await this.notificationService.create({
        userId: organizationId,
        title: subject,
        message,
        type: 'ORGANIZATION_MESSAGE',
        data: {
          messageId: savedMessage.id,
          senderId,
        },
      });

      // Send email notification
      await this.emailService.sendEmail({
        to: organization.contactInfo.email,
        subject: `New Message: ${subject}`,
        html: `
          <h1>${subject}</h1>
          <p>${message}</p>
          <p>This message was sent from your HMO administrator.</p>
        `,
      });

      return {
        success: true,
        message: 'Message sent successfully',
        data: savedMessage,
      };
    } catch (error) {
      throw error;
    }
  }

  async getMessages(organizationId: string) {
    try {
      const messages = await this.messageRepository.find({
        where: { organization: { id: organizationId } },
        relations: ['sender'],
        order: { createdAt: 'DESC' },
      });

      return {
        success: true,
        message: 'Messages retrieved successfully',
        data: messages,
      };
    } catch (error) {
      throw error;
    }
  }

  async getMessageById(messageId: string) {
    try {
      const message = await this.messageRepository.findOne({
        where: { id: messageId },
        relations: ['sender', 'organization'],
      });

      if (!message) {
        throw new NotFoundException('Message not found');
      }

      return {
        success: true,
        message: 'Message retrieved successfully',
        data: message,
      };
    } catch (error) {
      throw error;
    }
  }
}
