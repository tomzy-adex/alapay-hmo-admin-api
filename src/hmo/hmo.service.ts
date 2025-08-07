import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { HealthcarePlanRepository } from './repositories/healthcare-plan.repository';
import {
  CreateFamilyDiscountsDto,
  CreateHealthcarePlanDto,
} from './dto/create-healthcare-plan.dto';
import { AuthData } from 'src/utils/auth.strategy';
import { HmoRepository } from './repositories/hmo.repository';
import {
  ProcessStatus,
  Status,
  DownloadFormat,
  INotificationType,
} from 'src/utils/types';
import { Hmo } from './entities/hmo.entity';
import { UpdateHealthcarePlanDto } from './dto/update-healthcare-plan.dto';
import { AccountTierRepository } from './repositories/account-tier.repository';
import { CreateAccountTierDto } from './dto/create-account-tier.dto';
import { UpdateAccountTierDto } from './dto/update-account-tier.dto';
import {
  AccountTierQueryDto,
  HealthcarePlanQueryDto,
  HmoQueryDto,
  HmosQueryDto,
} from './dto/hmo-query.dto';
import { PlanSubscriptionRepository } from './repositories/plan-subscription.repository';
import { EnrollmentQueryDto } from './dto/enrollment-query.dto';
import { EnrollmentResponseDto } from './dto/enrollment-response.dto';
import { Like, Between, In } from 'typeorm';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import {
  EnrollmentMetricsDto,
  PaymentMetricsDto,
  TransactionHistoryDto,
  PerformanceMetricsDto,
  ServiceAnalyticsDto,
  PaymentAnalyticsDto,
} from './dto/dashboard-response.dto';
import { PaymentRepository } from '../payment/repositories/payment.repository';
import { TransactionRepository } from '../payment/repositories/transaction.repository';
import { EmailService } from '../email/email.service';
import { SendEmailDto } from 'src/email/dto/send-email.dto';
import { AccountApprovalDto } from 'src/user/dto/update-user.dto';
import { NotificationRepository } from 'src/notification/repositories/notification.repository';
import { HospitalRepository } from './repositories/hospital.repository';
import { UpdateHmoDto } from './dto/update-hmo.dto';

@Injectable()
export class HmoService {
  constructor(
    private readonly healthcarePlanRepository: HealthcarePlanRepository,
    private readonly hmoRepository: HmoRepository,
    private readonly accountTierRepository: AccountTierRepository,
    private readonly planSubscriptionRepository: PlanSubscriptionRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly emailService: EmailService,
    private readonly notificationRepository: NotificationRepository,
    private readonly hospitalRepository: HospitalRepository,
  ) {}

  async updateHmoDetails(
    id: string,
    payload: UpdateHmoDto,
    authData: AuthData,
  ) {
    try {
      const hmo = await this.hmoRepository.findOneBy({ id });

      if (!hmo) throw new NotFoundException('HMO does not exist.');

      await this.checkAdmin(authData.id, hmo.id);

      await this.hmoRepository.update({ id }, payload);

      const updatedHmo = await this.hmoRepository.findOneBy({ id });

      return {
        success: true,
        message: 'HMO details updated successfully.',
        data: updatedHmo,
      };
    } catch (error) {
      console.error('Error updating HMO details:', error);
      throw error;
    }
  }

  async getHmoById(authData: AuthData) {
    try {
      const hmo = await this.hmoRepository.findOne({
        where: { user: { id: authData.id } },
      });

      if (!hmo) throw new NotFoundException('HMO not found.');

      await this.checkAdmin(authData.id, hmo.id);

      return {
        success: true,
        message: 'HMO details retrieved successfully.',
        data: hmo,
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyHospitalAccount(id: string, payload: AccountApprovalDto) {
    try {
      const hospital = this.hospitalRepository;

      const { status, message } = payload;

      const isHospital = await hospital.findOneBy({ id });

      if (!isHospital)
        throw new BadRequestException('Hospital does not exist.');

      const notification: INotificationType = {
        title: `Hospital account has been ${status}.`,
        message,
      };

      const emailPayload: SendEmailDto = {
        to: isHospital.email,
        subject: notification.title,
        html: `Hello ${isHospital.name},
              <br/><br/>
              Your Hospital account has been ${status}. See more information below:
              <br/><br/>
             <b>${message}</b>
              `,
      };

      const accountStatus =
        status === ProcessStatus.APPROVED ? Status.ACTIVE : Status.DORMANT;

      await hospital.update(
        { id },
        { status, accountStatus, verificationComments: message },
      );
      await this.notificationRepository.save({ ...notification, hmo: { id } });
      await this.emailService.sendEmail(emailPayload);

      return {
        success: true,
        message: `${isHospital.name} hospital account was successfully ${status}`,
      };
    } catch (error) {
      throw error;
    }
  }

  async calculateFamilyPlanPrice(
    basePrice: number,
    dependents: number,
    discountRate: number,
  ): Promise<number> {
    const discountedPrice = basePrice * discountRate;
    return basePrice + discountedPrice * dependents;
  }

  async healthPlanCheck(
    id: string,
    hmo: Hmo,
    authData: AuthData,
    payload: CreateHealthcarePlanDto | UpdateHealthcarePlanDto,
  ): Promise<void> {
    if (!hmo) throw new NotFoundException('HMO does not exist.');

    if (hmo.status !== ProcessStatus.APPROVED)
      throw new ForbiddenException(
        `HMO acount is not Approved. Contact your supervisor.`,
      );

    if (hmo.accountStatus !== Status.ACTIVE)
      throw new ForbiddenException(
        `HMO acount is ${hmo.accountStatus}. Contact your supervisor.`,
      );

    const isAdmin = hmo.user.find((admin) => admin.id === id);

    if (!isAdmin.id) throw new NotFoundException('Admin does not exist.');

    if (isAdmin.id !== authData.id)
      throw new ForbiddenException('Unauthorized to create plan for this HMO.');

    const { familyPlanAvailable, dependentDiscountRate, maxDependents } =
      payload;

    if (familyPlanAvailable && !dependentDiscountRate && !maxDependents)
      throw new ForbiddenException(
        'There must be a defineddependentDiscountRate and maxDependents for a family plan.',
      );
  }

  async accountTierCheck(
    id: string,
    hmoId: string,
    authData: AuthData,
  ): Promise<void> {
    const hmo = await this.hmoRepository.findOne({
      where: { id: hmoId },
      relations: ['user'],
    });

    try {
      if (!hmo) throw new NotFoundException('HMO does not exist.');

      const isAdmin = hmo.user.find((admin) => admin.id === id);

      if (!isAdmin?.id) throw new NotFoundException('Admin does not exist.');

      if (isAdmin.id !== authData.id)
        throw new ForbiddenException(
          'Unauthorized to create plan for this HMO.',
        );
    } catch (error) {
      throw error;
    }
  }

  async checkAdmin(id: string, hmoId: string): Promise<void> {
    console.log('Debug - checkAdmin called with id:', id, 'hmoId:', hmoId);
    
    const hmo = await this.hmoRepository.findOne({
      where: { id: hmoId },
      relations: ['user'],
    });

    console.log('Debug - HMO found:', !!hmo);
    if (hmo) {
      console.log('Debug - HMO users:', hmo.user.map(u => ({ id: u.id, email: u.email })));
    }

    if (!hmo) {
      throw new ForbiddenException('HMO not found.');
    }

    const isAdmin = hmo.user.some(user => user.id === id);
    console.log('Debug - isAdmin:', isAdmin);
    
    if (!isAdmin) {
      throw new ForbiddenException(
        'Unauthorized to perform this action for this HMO.',
      );
    }
  }

  async createHealthcarePlan(
    hmoQuery: HmoQueryDto,
    authData: AuthData,
    payload: CreateHealthcarePlanDto,
  ) {
    try {
      const { adminId: id, hmoId } = hmoQuery;

      const hmo = await this.hmoRepository.findOne({
        where: { id: hmoId },
        relations: ['user', 'plans'],
      });

      if (payload.accountTierIds.length === 0)
        throw new ForbiddenException('Account tier ID is required.');

      // Validate that all account tier IDs exist and belong to this HMO
      const accountTiers = await this.accountTierRepository.find({
        where: { 
          id: In(payload.accountTierIds),
          hmo: { id: hmoId }
        },
        relations: ['hmo']
      });

      if (accountTiers.length !== payload.accountTierIds.length) {
        const foundIds = accountTiers.map(tier => tier.id);
        const missingIds = payload.accountTierIds.filter(id => !foundIds.includes(id));
        throw new BadRequestException(
          `Account tier(s) not found or don't belong to this HMO: ${missingIds.join(', ')}`
        );
      }

      await this.healthPlanCheck(id, hmo, authData, payload);

      const isPlanExist = hmo.plans.some((plan) => plan.name === payload.name);

      if (isPlanExist)
        throw new ForbiddenException(
          'The health plan aleady exists for this HMO.',
        );

      const newPlan = this.healthcarePlanRepository.create({
        ...payload,
        hmo: { id: hmoId },
        accountTiers: payload.accountTierIds.map((id: string) => ({ id })),
      });
      const createdPlan = await this.healthcarePlanRepository.save(newPlan);

      return {
        success: true,
        message: `Healthcare plan created successfully.`,
        data: createdPlan,
      };
    } catch (error) {
      console.error('Error creating healthcare plan:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        hmoId: hmoQuery.hmoId,
        adminId: hmoQuery.adminId,
        payload: payload
      });
      
      // Re-throw the original error for better debugging
      throw error;
    }
  }

  async updateHealthcarePlan(
    healthcarePlanQueryDto: HealthcarePlanQueryDto,
    authData: AuthData,
    payload: UpdateHealthcarePlanDto,
  ) {
    try {
      const { adminId: id, hmoId, planId } = healthcarePlanQueryDto;
      const hmo = await this.hmoRepository.findOne({
        where: { id: hmoId },
        relations: ['user', 'plans'],
      });

      await this.healthPlanCheck(id, hmo, authData, payload);

      const plan = await this.healthcarePlanRepository.findOneBy({
        id: planId,
      });

      if (!plan) throw new NotFoundException('Healthcare plan not found.');

      const update = await this.healthcarePlanRepository.update(
        { id: plan.id },
        {
          ...payload,
          ...(payload.accountTierIds && {
            accountTiers: payload.accountTierIds.map((id: string) => ({ id })),
          }),
        },
      );

      return {
        success: true,
        message: `Healthcare plan updated successfully.`,
        data: update,
      };
    } catch (error) {
      console.error('Error updating healthcare plan:', error);
      throw new InternalServerErrorException(
        'Could not update healthcare plan',
      );
    }
  }

  async getHealthcarePlans(hmoQuery: HmosQueryDto) {
    try {
      const { adminId: id, hmoId, page, limit } = hmoQuery;

      await this.checkAdmin(id, hmoId);

      const [plans, total] = await this.healthcarePlanRepository.findAndCount({
        where: { hmo: { id: hmoId } },
        relations: ['hmo', 'accountTiers', 'hospitals'],
        skip: (page - 1) * limit,
        take: limit,
        order: {
          createdAt: 'DESC',
        },
      });

      return {
        success: true,
        message: plans.length > 0 ? 'Healthcare plans fetched successfully.' : 'No healthcare plans found.',
        data: plans,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  async getHealthcarePlanById(healthcarePlanQueryDto: HealthcarePlanQueryDto) {
    try {
      const { adminId: id, hmoId, planId } = healthcarePlanQueryDto;
      await this.checkAdmin(id, hmoId);

      const plan = await this.healthcarePlanRepository.findOne({
        where: { id: planId, hmo: { id: hmoId } },
        relations: ['hmo', 'accountTiers', 'hospitals'],
      });

      if (!plan) throw new NotFoundException('Healthcare plan not found.');

      return {
        success: true,
        message: 'Healthcare plan fetched successfully.',
        data: plan,
      };
    } catch (error) {
      throw error;
    }
  }

  async getHealthcarePlansByHmoId(hmoId: string) {
    try {
      const [plans, total] = await this.healthcarePlanRepository.findAndCount({
        where: { hmo: { id: hmoId } },
        relations: ['hmo', 'accountTiers', 'hospitals'],
        order: {
          createdAt: 'DESC',
        },
      });

      return {
        success: true,
        message: plans.length > 0 ? 'Healthcare plans fetched successfully.' : 'No healthcare plans found.',
        data: plans,
        total,
      };
    } catch (error) {
      throw error;
    }
  }

  async getHmoStatus(hmoId: string) {
    try {
      const hmo = await this.hmoRepository.findOne({
        where: { id: hmoId },
        select: ['id', 'name', 'status', 'accountStatus']
      });

      if (!hmo) {
        throw new NotFoundException('HMO not found');
      }

      const canCreatePlans = hmo.status === ProcessStatus.APPROVED && hmo.accountStatus === Status.ACTIVE;

      return {
        success: true,
        message: 'HMO status retrieved successfully',
        data: {
          id: hmo.id,
          name: hmo.name,
          status: hmo.status,
          accountStatus: hmo.accountStatus,
          canCreatePlans,
          requiredStatus: ProcessStatus.APPROVED,
          requiredAccountStatus: Status.ACTIVE
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async createAccountTier(
    hmoQuery: HmoQueryDto,
    authData: AuthData,
    payload: CreateAccountTierDto,
  ) {
    try {
      const { adminId: id, hmoId } = hmoQuery;
      const tier = this.accountTierRepository;

      console.log('Debug - adminId from query:', id);
      console.log('Debug - authData.id from token:', authData.id);
      console.log('Debug - hmoId:', hmoId);

      await this.checkAdmin(id, hmoId);

      // Check for duplicate account tier with same name AND premium within the same HMO
      const existingAccountTier = await tier.findOne({
        where: { 
          name: payload.name,
          premium: payload.premium,
          hmo: { id: hmoId }
        },
        relations: ['hmo'],
      });

      if (existingAccountTier) {
        throw new ForbiddenException(
          `An account tier with name "${payload.name}" and premium ${payload.premium} already exists for this HMO.`,
        );
      }

      await this.accountTierCheck(id, hmoId, authData);

      const created = await tier.save({ ...payload, hmo: { id: hmoId } });

      return {
        success: true,
        message: `Account tier created successfully.`,
        data: created,
      };
    } catch (error) {
      console.error('Error creating account tier:', error);
      throw error;
    }
  }

  async updateAccountTier(
    accountTierQueryDto: AccountTierQueryDto,
    authData: AuthData,
    payload: UpdateAccountTierDto,
  ) {
    try {
      const { adminId: id, hmoId, accountTierId } = accountTierQueryDto;
      const tier = this.accountTierRepository;

      const accountTier = await tier.findOne({
        where: { id: accountTierId, hmo: { id: hmoId } },
      });

      if (!accountTier)
        throw new NotFoundException('Account tier does not exist.');

      await this.accountTierCheck(id, hmoId, authData);

      await tier.update({ id: accountTier.id }, { ...payload });

      return {
        success: true,
        message: `Account tier updated successfully.`,
      };
    } catch (error) {
      console.error('Error updating account tier:', error);
      throw error;
    }
  }

  async getAccountTiers(hmoQuery: HmosQueryDto) {
    try {
      const { adminId: id, hmoId, page, limit } = hmoQuery;

      await this.checkAdmin(id, hmoId);

      const [tiers, total] = await this.accountTierRepository.findAndCount({
        where: { hmo: { id: hmoId } },
        relations: ['hmo', 'healthcarePlans'],
        skip: (page - 1) * limit,
        take: limit,
        order: {
          createdAt: 'DESC',
        },
      });

      if (tiers.length === 0)
        throw new NotFoundException('Account tiers not found');

      return {
        success: true,
        message: 'Account tiers fetched successfully.',
        data: tiers,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  async getAccountTiersByHmoId(hmoId: string) {
    try {
      const [tiers, total] = await this.accountTierRepository.findAndCount({
        where: { hmo: { id: hmoId } },
        relations: ['hmo', 'healthcarePlans'],
        order: {
          createdAt: 'DESC',
        },
      });

      return {
        success: true,
        message: 'Account tiers fetched successfully.',
        data: tiers,
        total,
      };
    } catch (error) {
      throw error;
    }
  }

  async getAccountTierById(accountTierQueryDto: AccountTierQueryDto) {
    try {
      const { adminId: id, hmoId, accountTierId } = accountTierQueryDto;
      await this.checkAdmin(id, hmoId);

      const tier = await this.accountTierRepository.findOne({
        where: { id: accountTierId, hmo: { id: hmoId } },
        relations: ['hmo', 'healthcarePlans'],
      });

      if (!tier) throw new NotFoundException('Account tier not found.');

      return {
        success: true,
        message: 'Account tier fetched successfully.',
        data: tier,
      };
    } catch (error) {
      throw error;
    }
  }

  async setFamilyDiscounts(
    healthcarePlanQueryDto: HealthcarePlanQueryDto,
    familyDiscounts: CreateFamilyDiscountsDto,
  ) {
    try {
      const { planId, adminId, hmoId } = healthcarePlanQueryDto;
      const { familySize, discount, basePrice } = familyDiscounts;

      await this.checkAdmin(adminId, hmoId);

      const plan = await this.healthcarePlanRepository.findOne({
        where: { id: planId },
      });

      if (!plan) {
        throw new NotFoundException('Healthcare plan not found');
      }

      const price = await this.calculateFamilyPlanPrice(
        basePrice,
        familySize,
        discount,
      );

      plan.maxDependents = familySize;
      plan.dependentDiscountRate = price;

      const updatedPlan = await this.healthcarePlanRepository.save(plan);

      return {
        success: true,
        message: 'Family discounts set successfully.',
        data: updatedPlan,
      };
    } catch (error) {
      throw error;
    }
  }

  async getFamilyDiscounts(healthcarePlanQueryDto: HealthcarePlanQueryDto) {
    try {
      const { planId, adminId, hmoId } = healthcarePlanQueryDto;

      await this.checkAdmin(adminId, hmoId);

      const plan = await this.healthcarePlanRepository.findOne({
        where: { id: planId },
      });

      if (!plan) {
        throw new NotFoundException('Healthcare plan not found');
      }

      const { dependentDiscountRate, maxDependents } = plan;

      return {
        success: true,
        message: 'Family discounts retrieved successfully.',
        data: {
          dependentDiscountRate,
          maxDependents,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getEnrollments(hmoQuery: HmosQueryDto, query: EnrollmentQueryDto) {
    try {
      const { page, limit } = query;
      const { search, status, planType } = query;

      const whereConditions: any = {
        plan: { hmo: { id: hmoQuery.hmoId } },
      };

      if (search) {
        whereConditions.user = {
          firstName: Like(`%${search}%`),
        };
      }

      if (status) {
        whereConditions.status = status;
      }

      if (planType) {
        whereConditions.plan = {
          ...whereConditions.plan,
          coverageType: planType,
        };
      }

      const [subscriptions, total] =
        await this.planSubscriptionRepository.findAndCount({
          where: whereConditions,
          relations: ['user', 'plan', 'dependents', 'payment'],
          skip: (page - 1) * limit,
          take: limit,
          order: { createdAt: 'DESC' },
        });

      const enrollments: EnrollmentResponseDto[] = subscriptions.map(
        (subscription) => ({
          id: subscription.id,
          name: `${subscription.user.firstName} ${subscription.user.lastName}`,
          email: subscription.user.email,
          phoneNumber: subscription.user.phoneNumber,
          enrolleeNo: subscription.enrolleeNo,
          status: subscription.status,
          planName: subscription.plan.name,
          planType: subscription.plan.coverageType,
          startDate: subscription.createdAt,
          endDate: subscription.payment?.dueDate,
          dependentsCount: subscription.dependents?.length || 0,
          lastPaymentDate: subscription.payment?.createdAt,
          nextPaymentDate: subscription.payment?.dueDate,
        }),
      );

      return {
        success: true,
        message: 'Enrollments retrieved successfully.',
        data: enrollments,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw error;
    }
  }

  async downloadEnrollments(
    hmoQuery: HmosQueryDto,
    query: EnrollmentQueryDto,
    format: DownloadFormat,
  ) {
    try {
      const enrollments = await this.getEnrollments(hmoQuery, {
        ...query,
        limit: 1000,
        page: 1,
      });

      if (format === DownloadFormat.XLSX) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Enrollments');

        worksheet.columns = [
          { header: 'Name', key: 'name' },
          { header: 'Email', key: 'email' },
          { header: 'Phone', key: 'phoneNumber' },
          { header: 'Enrollee No', key: 'enrolleeNo' },
          { header: 'Status', key: 'status' },
          { header: 'Plan Name', key: 'planName' },
          { header: 'Plan Type', key: 'planType' },
          { header: 'Start Date', key: 'startDate' },
          { header: 'End Date', key: 'endDate' },
          { header: 'Dependents', key: 'dependentsCount' },
          { header: 'Last Payment', key: 'lastPaymentDate' },
          { header: 'Next Payment', key: 'nextPaymentDate' },
        ];

        enrollments.data.forEach((enrollment) => {
          worksheet.addRow({
            ...enrollment,
            startDate: enrollment.startDate.toLocaleDateString(),
            endDate: enrollment.endDate?.toLocaleDateString() || 'N/A',
            lastPaymentDate:
              enrollment.lastPaymentDate?.toLocaleDateString() || 'N/A',
            nextPaymentDate:
              enrollment.nextPaymentDate?.toLocaleDateString() || 'N/A',
          });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return {
          success: true,
          message: 'Enrollment data downloaded successfully.',
          data: buffer,
          filename: `enrollments-${new Date().toISOString()}.xlsx`,
        };
      } else if (format === DownloadFormat.PDF) {
        const doc = new PDFDocument();
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          const result = Buffer.concat(chunks);
          return {
            success: true,
            message: 'Enrollment data downloaded successfully.',
            data: result,
            filename: `enrollments-${new Date().toISOString()}.pdf`,
          };
        });

        // Add content to PDF
        doc.fontSize(16).text('Enrollment Report', { align: 'center' });
        doc.moveDown();

        enrollments.data.forEach((enrollment) => {
          doc.fontSize(12).text(`Name: ${enrollment.name}`);
          doc
            .fontSize(10)
            .text(`Email: ${enrollment.email}`)
            .text(`Phone: ${enrollment.phoneNumber}`)
            .text(`Enrollee No: ${enrollment.enrolleeNo}`)
            .text(`Status: ${enrollment.status}`)
            .text(`Plan: ${enrollment.planName} (${enrollment.planType})`)
            .text(`Start Date: ${enrollment.startDate.toLocaleDateString()}`)
            .text(
              `End Date: ${enrollment.endDate?.toLocaleDateString() || 'N/A'}`,
            )
            .text(`Dependents: ${enrollment.dependentsCount}`)
            .text(
              `Last Payment: ${enrollment.lastPaymentDate?.toLocaleDateString() || 'N/A'}`,
            )
            .text(
              `Next Payment: ${enrollment.nextPaymentDate?.toLocaleDateString() || 'N/A'}`,
            );
          doc.moveDown();
        });

        doc.end();
      }

      throw new InternalServerErrorException('Unsupported download format');
    } catch (error) {
      throw error;
    }
  }

  async getDashboardMetrics(
    hmoQuery: HmosQueryDto,
    query: DashboardQueryDto,
  ): Promise<{
    enrollmentMetrics: EnrollmentMetricsDto;
    paymentMetrics: PaymentMetricsDto;
    performanceMetrics: PerformanceMetricsDto;
  }> {
    try {
      const { startDate, endDate } = query;
      const dateFilter =
        startDate && endDate
          ? { createdAt: Between(new Date(startDate), new Date(endDate)) }
          : {};

      // Get enrollment metrics
      const enrollments = await this.planSubscriptionRepository.find({
        where: {
          plan: { hmo: { id: hmoQuery.hmoId } },
          ...dateFilter,
        },
        relations: ['plan'],
      });

      const enrollmentMetrics: EnrollmentMetricsDto = {
        totalEnrollments: enrollments.length,
        activeEnrollments: enrollments.filter((e) => e.status === Status.ACTIVE)
          .length,
        inactiveEnrollments: enrollments.filter(
          (e) => e.status === Status.DORMANT,
        ).length,
        suspendedEnrollments: enrollments.filter(
          (e) => e.status === Status.SUSPENDED,
        ).length,
        enrollmentsByPlan: this.groupByPlan(enrollments),
        enrollmentsByStatus: this.groupByStatus(enrollments),
      };

      // Get payment metrics
      const payments = await this.paymentRepository.find({
        where: {
          subscriptions: { plan: { hmo: { id: hmoQuery.hmoId } } },
          ...dateFilter,
        },
        relations: ['subscriptions'],
      });

      const paymentMetrics: PaymentMetricsDto = {
        totalPremiumCollected: payments.reduce(
          (sum, p) => sum + Number(p.amount),
          0,
        ),
        pendingRemittances: payments.filter(
          (p) => p.status === ProcessStatus.PENDING,
        ).length,
        overdueRemittances: payments.filter(
          (p) => p.status === ProcessStatus.OVERDUE,
        ).length,
        paymentTrends: this.calculatePaymentTrends(payments),
        remittanceSchedule: this.getRemittanceSchedule(payments),
      };

      // Get performance metrics
      const performanceMetrics: PerformanceMetricsDto = {
        activeUsers: enrollmentMetrics.activeEnrollments,
        totalPremiumCollected: paymentMetrics.totalPremiumCollected,
        averagePremiumPerUser:
          enrollmentMetrics.activeEnrollments > 0
            ? paymentMetrics.totalPremiumCollected /
              enrollmentMetrics.activeEnrollments
            : 0,
        paymentCompletionRate: this.calculatePaymentCompletionRate(payments),
        overduePaymentRate: this.calculateOverduePaymentRate(payments),
        monthlyTrends: this.calculateMonthlyTrends(payments, enrollments),
      };

      return {
        enrollmentMetrics,
        paymentMetrics,
        performanceMetrics,
      };
    } catch (error) {
      throw error;
    }
  }

  async getTransactionHistory(
    hmoQuery: HmosQueryDto,
    query: DashboardQueryDto,
  ): Promise<{
    transactions: TransactionHistoryDto[];
    total: number;
  }> {
    try {
      const { startDate, endDate, search } = query;
      const whereConditions: any = {
        payments: {
          subscriptions: { plan: { hmo: { id: hmoQuery.hmoId } } },
        },
      };

      if (startDate && endDate) {
        whereConditions.createdAt = Between(
          new Date(startDate),
          new Date(endDate),
        );
      }

      if (search) {
        whereConditions.payments = {
          ...whereConditions.payments,
          user: {
            firstName: Like(`%${search}%`),
          },
        };
      }

      const [transactions, total] =
        await this.transactionRepository.findAndCount({
          where: whereConditions,
          relations: [
            'payments',
            'payments.user',
            'payments.subscriptions',
            'payments.subscriptions.plan',
          ],
          order: { createdAt: 'DESC' },
          skip: (hmoQuery.page - 1) * hmoQuery.limit,
          take: hmoQuery.limit,
        });

      const transactionHistory: TransactionHistoryDto[] = transactions.map(
        (t) => {
          // Get the first payment and subscription for this transaction
          const payment =
            t.payments && t.payments.length > 0 ? t.payments[0] : null;
          const subscription =
            payment && payment.subscriptions && payment.subscriptions.length > 0
              ? payment.subscriptions[0]
              : null;

          return {
            id: t.id,
            date: t.createdAt,
            amount: t.amount,
            status: t.status,
            type: t.reference || 'Payment',
            userDetails:
              payment && payment.user
                ? {
                    name: `${payment.user.firstName} ${payment.user.lastName}`,
                    email: payment.user.email,
                    enrolleeNo: subscription ? subscription.enrolleeNo : '',
                  }
                : {
                    name: 'Unknown',
                    email: 'Unknown',
                    enrolleeNo: '',
                  },
            planDetails:
              subscription && subscription.plan
                ? {
                    name: subscription.plan.name,
                    type: subscription.plan.coverageType,
                  }
                : {
                    name: 'Unknown',
                    type: 'Unknown',
                  },
          };
        },
      );

      return {
        transactions: transactionHistory,
        total,
      };
    } catch (error) {
      throw error;
    }
  }

  async getServiceAnalytics(
    hmoQuery: HmosQueryDto,
    query: DashboardQueryDto,
  ): Promise<ServiceAnalyticsDto> {
    try {
      const { startDate, endDate } = query;
      const dateFilter =
        startDate && endDate
          ? { createdAt: Between(new Date(startDate), new Date(endDate)) }
          : {};

      // Get service usage data
      const serviceUsage = await this.planSubscriptionRepository
        .createQueryBuilder('subscription')
        .select('plan.name', 'serviceName')
        .addSelect('COUNT(*)', 'usageCount')
        .leftJoin('subscription.plan', 'plan')
        .where('plan.hmo.id = :hmoId', { hmoId: hmoQuery.hmoId })
        .andWhere(dateFilter)
        .groupBy('plan.name')
        .getRawMany();

      // Get user demographics
      const userDemographics = await this.planSubscriptionRepository
        .createQueryBuilder('subscription')
        .select('user.ageGroup', 'ageGroup')
        .addSelect('COUNT(*)', 'count')
        .leftJoin('subscription.user', 'user')
        .where('subscription.plan.hmo.id = :hmoId', { hmoId: hmoQuery.hmoId })
        .andWhere(dateFilter)
        .groupBy('user.ageGroup')
        .getRawMany();

      // Get plan performance
      const planPerformance = await this.planSubscriptionRepository
        .createQueryBuilder('subscription')
        .select('plan.name', 'planName')
        .addSelect('COUNT(DISTINCT subscription.user.id)', 'activeUsers')
        .addSelect('SUM(payment.amount)', 'revenue')
        .leftJoin('subscription.plan', 'plan')
        .leftJoin('subscription.payment', 'payment')
        .where('plan.hmo.id = :hmoId', { hmoId: hmoQuery.hmoId })
        .andWhere(dateFilter)
        .groupBy('plan.name')
        .getRawMany();

      return {
        serviceUsage,
        userDemographics,
        planPerformance,
      };
    } catch (error) {
      throw error;
    }
  }

  async getPaymentAnalytics(
    hmoQuery: HmosQueryDto,
    query: DashboardQueryDto,
  ): Promise<PaymentAnalyticsDto> {
    try {
      const { startDate, endDate } = query;
      const dateFilter =
        startDate && endDate
          ? { createdAt: Between(new Date(startDate), new Date(endDate)) }
          : {};

      // Get payment patterns
      const paymentPatterns = await this.paymentRepository
        .createQueryBuilder('payment')
        .select('DATE(payment.createdAt)', 'timePeriod')
        .addSelect('SUM(payment.amount)', 'amount')
        .addSelect('COUNT(*)', 'count')
        .where('payment.subscriptions.plan.hmo.id = :hmoId', {
          hmoId: hmoQuery.hmoId,
        })
        .andWhere(dateFilter)
        .groupBy('DATE(payment.createdAt)')
        .orderBy('DATE(payment.createdAt)', 'ASC')
        .getRawMany();

      // Get overdue payments by plan type
      const overduePayments = await this.paymentRepository
        .createQueryBuilder('payment')
        .select('plan.coverageType', 'planType')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(payment.amount)', 'amount')
        .leftJoin('payment.subscriptions', 'subscription')
        .leftJoin('subscription.plan', 'plan')
        .where('plan.hmo.id = :hmoId', { hmoId: hmoQuery.hmoId })
        .andWhere('payment.status = :status', { status: ProcessStatus.OVERDUE })
        .andWhere(dateFilter)
        .groupBy('plan.coverageType')
        .getRawMany();

      // Get revenue trends
      const revenueTrends = await this.paymentRepository
        .createQueryBuilder('payment')
        .select('DATE(payment.createdAt)', 'period')
        .addSelect('SUM(payment.amount)', 'collected')
        .addSelect('SUM(payment.expectedAmount)', 'expected')
        .where('payment.subscriptions.plan.hmo.id = :hmoId', {
          hmoId: hmoQuery.hmoId,
        })
        .andWhere(dateFilter)
        .groupBy('DATE(payment.createdAt)')
        .orderBy('DATE(payment.createdAt)', 'ASC')
        .getRawMany();

      return {
        paymentPatterns,
        overduePayments,
        revenueTrends,
      };
    } catch (error) {
      throw error;
    }
  }

  private groupByPlan(
    enrollments: any[],
  ): { planName: string; count: number }[] {
    const planGroups = enrollments.reduce(
      (groups, enrollment) => {
        const planName = enrollment.plan.name;
        groups[planName] = (groups[planName] || 0) + 1;
        return groups;
      },
      {} as Record<string, number>,
    );

    return Object.entries(planGroups).map(([planName, count]) => ({
      planName,
      count: count as number,
    }));
  }

  private groupByStatus(
    enrollments: any[],
  ): { status: Status; count: number }[] {
    const statusGroups = enrollments.reduce(
      (groups, enrollment) => {
        const status = enrollment.status;
        groups[status] = (groups[status] || 0) + 1;
        return groups;
      },
      {} as Record<Status, number>,
    );

    return Object.entries(statusGroups).map(([status, count]) => ({
      status: status as Status,
      count: count as number,
    }));
  }

  private calculatePaymentTrends(
    payments: any[],
  ): { date: string; amount: number }[] {
    const trends = payments.reduce(
      (groups, payment) => {
        const date = payment.createdAt.toISOString().split('T')[0];
        groups[date] = (groups[date] || 0) + Number(payment.amount);
        return groups;
      },
      {} as Record<string, number>,
    );

    return Object.entries(trends).map(([date, amount]) => ({
      date,
      amount: amount as number,
    }));
  }

  private getRemittanceSchedule(
    payments: any[],
  ): { dueDate: string; amount: number; status: string }[] {
    return payments.map((payment) => ({
      dueDate: payment.dueDate.toISOString().split('T')[0],
      amount: Number(payment.amount),
      status: payment.status,
    }));
  }

  private calculatePaymentCompletionRate(payments: any[]): number {
    if (payments.length === 0) return 0;
    const completedPayments = payments.filter(
      (p) => p.status === ProcessStatus.APPROVED,
    ).length;
    return (completedPayments / payments.length) * 100;
  }

  private calculateOverduePaymentRate(payments: any[]): number {
    if (payments.length === 0) return 0;
    const overduePayments = payments.filter(
      (p) => p.status === ProcessStatus.OVERDUE,
    ).length;
    return (overduePayments / payments.length) * 100;
  }

  private calculateMonthlyTrends(
    payments: any[],
    enrollments: any[],
  ): { month: string; activeUsers: number; totalPremium: number }[] {
    const monthlyData = payments.reduce(
      (groups, payment) => {
        const month = payment.createdAt.toISOString().slice(0, 7);
        if (!groups[month]) {
          groups[month] = {
            activeUsers: enrollments.filter(
              (e) =>
                e.status === Status.ACTIVE &&
                e.createdAt.toISOString().slice(0, 7) === month,
            ).length,
            totalPremium: 0,
          };
        }
        groups[month].totalPremium += Number(payment.amount);
        return groups;
      },
      {} as Record<string, { activeUsers: number; totalPremium: number }>,
    );

    return Object.entries(monthlyData).map(([month, data]) => {
      const typedData = data as { activeUsers: number; totalPremium: number };
      return {
        month,
        activeUsers: typedData.activeUsers,
        totalPremium: typedData.totalPremium,
      };
    });
  }
}
