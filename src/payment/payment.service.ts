import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentOptionRepository } from './repositories/payment-option.repository';
import { HealthcarePlanRepository } from 'src/hmo/repositories/healthcare-plan.repository';
import {
  PaymentOptionDto,
  UpdatePaymentOptionDto,
} from './dto/payment-option.dto';
import { PaymentOption } from './entities/payment-option.entity';
import { HealthcarePlanQueryDto } from 'src/hmo/dto/hmo-query.dto';
import { HmoService } from 'src/hmo/hmo.service';
import { PaymentDuration, ProcessStatus } from 'src/utils/types';
import { QueryDto } from 'src/config/dto/query.dto';
import { PaymentRepository } from './repositories/payment.repository';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentOptionRepository: PaymentOptionRepository,
    private readonly healthcarePlanRepository: HealthcarePlanRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly hmoService: HmoService,
    private readonly emailService: EmailService,
  ) {}

  async createPaymentOptions(
    healthcarePlanQueryDto: HealthcarePlanQueryDto,
    options: PaymentOptionDto[],
  ) {
    try {
      const { planId, adminId, hmoId } = healthcarePlanQueryDto;

      await this.hmoService.checkAdmin(adminId, hmoId);

      const plan = await this.healthcarePlanRepository.findOne({
        where: { id: planId },
      });

      if (!plan) {
        throw new NotFoundException('Healthcare plan not found');
      }

      const paymentOptions = options.map((option) => {
        const paymentOption = new PaymentOption();
        paymentOption.name = option.name;
        paymentOption.duration = option.duration;
        paymentOption.plan.id = plan.id;

        // Check if the duration matches the payment option type
        if (PaymentDuration[option.name] !== option.duration) {
          throw new ForbiddenException(
            `Duration for ${option.name} does not match the expected value`,
          );
        }

        return paymentOption;
      });

      const created = await this.paymentOptionRepository.save(paymentOptions);

      return {
        success: true,
        message: 'Payment options configured successfully.',
        data: created,
      };
    } catch (error) {
      throw error;
    }
  }

  async updatePaymentOptions(
    healthcarePlanQueryDto: HealthcarePlanQueryDto,
    options: UpdatePaymentOptionDto[],
  ) {
    try {
      const { planId, adminId, hmoId } = healthcarePlanQueryDto;

      await this.hmoService.checkAdmin(adminId, hmoId);

      const plan = await this.healthcarePlanRepository.findOne({
        where: { id: planId },
      });

      if (!plan) {
        throw new NotFoundException('Healthcare plan not found');
      }

      const existingOptions = await this.paymentOptionRepository.find({
        where: { plan: { id: planId } },
      });

      const updatedOptions = options.map((option) => {
        const existingOption = existingOptions.find(
          (eo) => eo.id === option.id,
        );

        if (!existingOption) {
          throw new NotFoundException(
            `Payment option with ID ${option.id} not found for the plan`,
          );
        }

        existingOption.duration = option.duration;

        // Check if the duration matches the payment option type
        if (PaymentDuration[option.name] !== option.duration) {
          throw new ForbiddenException(
            `Duration for ${option.name} does not match the expected value`,
          );
        }

        return existingOption;
      });

      const updated = await this.paymentOptionRepository.save(updatedOptions);

      return {
        success: true,
        message: 'Payment options updated successfully.',
        data: updated,
      };
    } catch (error) {
      throw error;
    }
  }

  async getPaymentOptions(
    healthcarePlanQueryDto: HealthcarePlanQueryDto,
    query: QueryDto,
  ) {
    const { page, limit } = query;
    try {
      const { planId, adminId, hmoId } = healthcarePlanQueryDto;

      await this.hmoService.checkAdmin(adminId, hmoId);

      const plan = await this.healthcarePlanRepository.findOne({
        where: { id: planId },
      });

      if (!plan) {
        throw new NotFoundException('Healthcare plan not found');
      }

      const [paymentOptions, total] =
        await this.paymentOptionRepository.findAndCount({
          where: { plan: { id: planId } },
          skip: (page - 1) * limit,
          take: limit,
        });

      return {
        success: true,
        message: 'Payment options retrieved successfully.',
        data: paymentOptions,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw error;
    }
  }

  async getPaymentOptionById(
    healthcarePlanQueryDto: HealthcarePlanQueryDto,
    paymentOptionId: string,
  ) {
    try {
      const { planId, adminId, hmoId } = healthcarePlanQueryDto;

      await this.hmoService.checkAdmin(adminId, hmoId);

      const plan = await this.healthcarePlanRepository.findOne({
        where: { id: planId },
      });

      if (!plan) {
        throw new NotFoundException('Healthcare plan not found');
      }

      const paymentOption = await this.paymentOptionRepository.findOne({
        where: { id: paymentOptionId, plan: { id: planId } },
      });

      if (!paymentOption) {
        throw new NotFoundException('Payment option not found');
      }

      return {
        success: true,
        message: 'Payment option retrieved successfully.',
        data: paymentOption,
      };
    } catch (error) {
      throw error;
    }
  }

  async getPremiumPayments(
    healthcarePlanQueryDto: HealthcarePlanQueryDto,
    query: QueryDto,
  ) {
    const { page, limit } = query;
    try {
      const { adminId, hmoId } = healthcarePlanQueryDto;

      await this.hmoService.checkAdmin(adminId, hmoId);

      const [payments, total] = await this.paymentRepository.findAndCount({
        where: { subscriptions: { plan: { hmo: { id: hmoId } } } },
        relations: ['user', 'subscriptions'],
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      const paymentDetails = payments.map((payment) => ({
        name: `${payment.user.firstName} ${payment.user.lastName}`,
        email: payment.user.email,
        phone: payment.user.phoneNumber,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        dueDate: payment.dueDate,
        receiptUrl: payment.receiptUrl,
        planId: payment.subscriptions[0].plan.id,
        plan: payment.subscriptions[0].plan.name,
        planType: payment.subscriptions[0].plan.coverageType,
        planStatus: payment.subscriptions[0].plan.status,
        planDuration: payment.subscriptions[0].plan.pricingStructure,
        planEnrolleeNo: payment.subscriptions[0].enrolleeNo,
        amount: payment.amount,
        paymentDate: payment.createdAt,
      }));

      return {
        success: true,
        message: 'Premium payments retrieved successfully.',
        data: paymentDetails,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw error;
    }
  }

  async getRemittanceSchedule(
    healthcarePlanQueryDto: HealthcarePlanQueryDto,
    query: QueryDto,
  ) {
    const { page, limit } = query;
    try {
      const { adminId, hmoId } = healthcarePlanQueryDto;

      await this.hmoService.checkAdmin(adminId, hmoId);

      const [remittances, total] = await this.paymentRepository.findAndCount({
        where: { subscriptions: { plan: { hmo: { id: hmoId } } } },
        relations: ['user', 'subscriptions'],
        skip: (page - 1) * limit,
        take: limit,
        order: { dueDate: 'ASC' },
      });

      const remittanceDetails = remittances.map((remittance) => ({
        remittanceDate: remittance.dueDate,
        amount: remittance.amount,
        status: remittance.status,
      }));

      return {
        success: true,
        message: 'Remittance schedule retrieved successfully.',
        data: remittanceDetails,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw error;
    }
  }

  async notifyOutstandingPayments(
    healthcarePlanQueryDto: HealthcarePlanQueryDto,
  ) {
    try {
      const { adminId, hmoId } = healthcarePlanQueryDto;

      await this.hmoService.checkAdmin(adminId, hmoId);

      const overduePayments = await this.paymentRepository.find({
        where: {
          subscriptions: { plan: { hmo: { id: hmoId } } },
          status: ProcessStatus.OVERDUE,
        },
        relations: ['user', 'subscriptions'],
      });

      const partialPayments = await this.paymentRepository.find({
        where: {
          subscriptions: { plan: { hmo: { id: hmoId } } },
          status: ProcessStatus.PARTIAL,
        },
        relations: ['user', 'subscriptions'],
      });

      const outstandingPayments = [...overduePayments, ...partialPayments];

      if (outstandingPayments.length === 0) {
        return {
          success: true,
          message: 'No outstanding payments found.',
        };
      }

      const notifications = outstandingPayments.map((payment) => ({
        name: `${payment.user.firstName} ${payment.user.lastName}`,
        email: payment.user.email,
        phone: payment.user.phoneNumber,
        outstandingAmount: payment.amount,
        dueDate: payment.dueDate,
        planName: payment.subscriptions[0].plan.name,
        enrolleeNo: payment.subscriptions[0].enrolleeNo,
      }));

      // Send email notifications for each outstanding payment
      for (const notification of notifications) {
        const subject = 'Outstanding Payment Reminder';
        const html = `
          <h2>Outstanding Payment Reminder</h2>
          <p>Dear ${notification.name},</p>
          <p>This is a reminder that you have an outstanding payment for your healthcare plan.</p>
          <p><strong>Details:</strong></p>
          <ul>
            <li>Plan: ${notification.planName}</li>
            <li>Enrollee Number: ${notification.enrolleeNo}</li>
            <li>Outstanding Amount: ${notification.outstandingAmount}</li>
            <li>Due Date: ${new Date(notification.dueDate).toLocaleDateString()}</li>
          </ul>
          <p>Please make the payment as soon as possible to avoid any service interruptions.</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>Your Healthcare Provider</p>
        `;

        await this.emailService.sendEmail({
          to: notification.email,
          subject,
          html,
        });
      }

      return {
        success: true,
        message: 'Outstanding payment notifications sent successfully.',
        data: notifications,
      };
    } catch (error) {
      throw error;
    }
  }
}
