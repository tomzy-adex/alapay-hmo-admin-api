import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { Transaction } from '../../payment/entities/transaction.entity';
import { TransactionSearchDto } from '../dto/transaction-query.dto';

@Injectable()
export class TransactionsRepository extends TypeOrmRepository<Transaction> {
  constructor(private readonly dataSource: DataSource) {
    super(Transaction, dataSource.createEntityManager());
  }

  async findTransactionsWithFilters(searchDto: TransactionSearchDto) {
    const queryBuilder = this.createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.payments', 'payments')
      .leftJoinAndSelect('payments.user', 'user')
      .leftJoinAndSelect('payments.paymentOption', 'paymentOption')
      .leftJoinAndSelect('payments.subscriptions', 'subscriptions')
      .leftJoinAndSelect('subscriptions.plan', 'plan')
      .leftJoinAndSelect('user.hmo', 'hmo')
      .leftJoinAndSelect('user.organization', 'organization');

    // Apply search filters
    if (searchDto.search) {
      queryBuilder.andWhere(
        '(transaction.reference ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${searchDto.search}%` }
      );
    }

    // Apply status filter
    if (searchDto.status) {
      queryBuilder.andWhere('transaction.status = :status', { 
        status: searchDto.status 
      });
    }

    // Apply user filter
    if (searchDto.userId) {
      queryBuilder.andWhere('user.id = :userId', { userId: searchDto.userId });
    }

    // Apply HMO filter
    if (searchDto.hmoId) {
      queryBuilder.andWhere('hmo.id = :hmoId', { hmoId: searchDto.hmoId });
    }

    // Apply plan filter
    if (searchDto.planId) {
      queryBuilder.andWhere('plan.id = :planId', { planId: searchDto.planId });
    }

    // Apply payment method filter
    if (searchDto.paymentMethod) {
      queryBuilder.andWhere('payments.paymentMethod = :paymentMethod', { 
        paymentMethod: searchDto.paymentMethod 
      });
    }

    // Apply amount range filters
    if (searchDto.minAmount !== undefined) {
      queryBuilder.andWhere('transaction.amount >= :minAmount', { 
        minAmount: searchDto.minAmount 
      });
    }

    if (searchDto.maxAmount !== undefined) {
      queryBuilder.andWhere('transaction.amount <= :maxAmount', { 
        maxAmount: searchDto.maxAmount 
      });
    }

    // Apply date range filters
    if (searchDto.startDate) {
      queryBuilder.andWhere('transaction.createdAt >= :startDate', { 
        startDate: searchDto.startDate 
      });
    }

    if (searchDto.endDate) {
      queryBuilder.andWhere('transaction.createdAt <= :endDate', { 
        endDate: searchDto.endDate 
      });
    }

    // Apply year filter
    if (searchDto.year) {
      queryBuilder.andWhere('EXTRACT(YEAR FROM transaction.createdAt) = :year', { 
        year: searchDto.year 
      });
    }

    // Apply month filter
    if (searchDto.month) {
      queryBuilder.andWhere('EXTRACT(MONTH FROM transaction.createdAt) = :month', { 
        month: searchDto.month 
      });
    }

    // Apply transaction type filter
    if (searchDto.transactionType) {
      queryBuilder.andWhere('transaction.reference ILIKE :transactionType', { 
        transactionType: `%${searchDto.transactionType}%` 
      });
    }

    // Apply sorting
    const sortBy = searchDto.sortBy || 'createdAt';
    const sortOrder = searchDto.sortOrder || 'DESC';
    queryBuilder.orderBy(`transaction.${sortBy}`, sortOrder);

    // Apply pagination
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    return queryBuilder.getManyAndCount();
  }

  async findTransactionById(id: string) {
    return this.createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.payments', 'payments')
      .leftJoinAndSelect('payments.user', 'user')
      .leftJoinAndSelect('payments.paymentOption', 'paymentOption')
      .leftJoinAndSelect('payments.subscriptions', 'subscriptions')
      .leftJoinAndSelect('subscriptions.plan', 'plan')
      .leftJoinAndSelect('subscriptions.dependents', 'dependents')
      .leftJoinAndSelect('user.hmo', 'hmo')
      .leftJoinAndSelect('user.organization', 'organization')
      .leftJoinAndSelect('user.wallet', 'wallet')
      .where('transaction.id = :id', { id })
      .getOne();
  }

  async getTransactionStats() {
    const totalTransactions = await this.createQueryBuilder('transaction').getCount();

    const completedTransactions = await this.createQueryBuilder('transaction')
      .where('transaction.status = :status', { status: 'completed' })
      .getCount();

    const pendingTransactions = await this.createQueryBuilder('transaction')
      .where('transaction.status = :status', { status: 'pending' })
      .getCount();

    const failedTransactions = await this.createQueryBuilder('transaction')
      .where('transaction.status = :status', { status: 'failed' })
      .getCount();

    const totalAmount = await this.createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'totalAmount')
      .where('transaction.status = :status', { status: 'completed' })
      .getRawOne();

    const averageAmount = await this.createQueryBuilder('transaction')
      .select('AVG(transaction.amount)', 'averageAmount')
      .where('transaction.status = :status', { status: 'completed' })
      .getRawOne();

    const transactionsByStatus = await this.createQueryBuilder('transaction')
      .select('transaction.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(transaction.amount)', 'totalAmount')
      .groupBy('transaction.status')
      .getRawMany();

    const transactionsByMonth = await this.createQueryBuilder('transaction')
      .select('EXTRACT(YEAR FROM transaction.createdAt)', 'year')
      .addSelect('EXTRACT(MONTH FROM transaction.createdAt)', 'month')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(transaction.amount)', 'totalAmount')
      .groupBy('EXTRACT(YEAR FROM transaction.createdAt), EXTRACT(MONTH FROM transaction.createdAt)')
      .orderBy('year', 'DESC')
      .addOrderBy('month', 'DESC')
      .getRawMany();

    return {
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      failedTransactions,
      totalAmount: parseFloat(totalAmount?.totalAmount || '0'),
      averageAmount: parseFloat(averageAmount?.averageAmount || '0'),
      transactionsByStatus,
      transactionsByMonth,
    };
  }

  async getTransactionStatsByYear(year: number) {
    const totalTransactions = await this.createQueryBuilder('transaction')
      .where('EXTRACT(YEAR FROM transaction.createdAt) = :year', { year })
      .getCount();

    const completedTransactions = await this.createQueryBuilder('transaction')
      .where('EXTRACT(YEAR FROM transaction.createdAt) = :year', { year })
      .andWhere('transaction.status = :status', { status: 'completed' })
      .getCount();

    const totalAmount = await this.createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'totalAmount')
      .where('EXTRACT(YEAR FROM transaction.createdAt) = :year', { year })
      .andWhere('transaction.status = :status', { status: 'completed' })
      .getRawOne();

    const averageAmount = await this.createQueryBuilder('transaction')
      .select('AVG(transaction.amount)', 'averageAmount')
      .where('EXTRACT(YEAR FROM transaction.createdAt) = :year', { year })
      .andWhere('transaction.status = :status', { status: 'completed' })
      .getRawOne();

    const transactionsByMonth = await this.createQueryBuilder('transaction')
      .select('EXTRACT(MONTH FROM transaction.createdAt)', 'month')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(transaction.amount)', 'totalAmount')
      .where('EXTRACT(YEAR FROM transaction.createdAt) = :year', { year })
      .groupBy('EXTRACT(MONTH FROM transaction.createdAt)')
      .orderBy('month', 'ASC')
      .getRawMany();

    const transactionsByStatus = await this.createQueryBuilder('transaction')
      .select('transaction.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(transaction.amount)', 'totalAmount')
      .where('EXTRACT(YEAR FROM transaction.createdAt) = :year', { year })
      .groupBy('transaction.status')
      .getRawMany();

    return {
      year,
      totalTransactions,
      completedTransactions,
      pendingTransactions: totalTransactions - completedTransactions,
      totalAmount: parseFloat(totalAmount?.totalAmount || '0'),
      averageAmount: parseFloat(averageAmount?.averageAmount || '0'),
      transactionsByMonth,
      transactionsByStatus,
    };
  }

  async getTransactionsByUser(userId: string) {
    return this.createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.payments', 'payments')
      .leftJoinAndSelect('payments.user', 'user')
      .leftJoinAndSelect('payments.paymentOption', 'paymentOption')
      .leftJoinAndSelect('payments.subscriptions', 'subscriptions')
      .leftJoinAndSelect('subscriptions.plan', 'plan')
      .where('user.id = :userId', { userId })
      .orderBy('transaction.createdAt', 'DESC')
      .getMany();
  }

  async getTransactionsByHmo(hmoId: string) {
    return this.createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.payments', 'payments')
      .leftJoinAndSelect('payments.user', 'user')
      .leftJoinAndSelect('payments.paymentOption', 'paymentOption')
      .leftJoinAndSelect('payments.subscriptions', 'subscriptions')
      .leftJoinAndSelect('subscriptions.plan', 'plan')
      .leftJoinAndSelect('user.hmo', 'hmo')
      .where('hmo.id = :hmoId', { hmoId })
      .orderBy('transaction.createdAt', 'DESC')
      .getMany();
  }

  async getTransactionsByPlan(planId: string) {
    return this.createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.payments', 'payments')
      .leftJoinAndSelect('payments.user', 'user')
      .leftJoinAndSelect('payments.paymentOption', 'paymentOption')
      .leftJoinAndSelect('payments.subscriptions', 'subscriptions')
      .leftJoinAndSelect('subscriptions.plan', 'plan')
      .where('plan.id = :planId', { planId })
      .orderBy('transaction.createdAt', 'DESC')
      .getMany();
  }

  async getRecentTransactions(limit: number = 10) {
    return this.createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.payments', 'payments')
      .leftJoinAndSelect('payments.user', 'user')
      .leftJoinAndSelect('payments.paymentOption', 'paymentOption')
      .leftJoinAndSelect('payments.subscriptions', 'subscriptions')
      .leftJoinAndSelect('subscriptions.plan', 'plan')
      .orderBy('transaction.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  async getHighValueTransactions(minAmount: number = 100000) {
    return this.createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.payments', 'payments')
      .leftJoinAndSelect('payments.user', 'user')
      .leftJoinAndSelect('payments.paymentOption', 'paymentOption')
      .leftJoinAndSelect('payments.subscriptions', 'subscriptions')
      .leftJoinAndSelect('subscriptions.plan', 'plan')
      .where('transaction.amount >= :minAmount', { minAmount })
      .orderBy('transaction.amount', 'DESC')
      .getMany();
  }
}
