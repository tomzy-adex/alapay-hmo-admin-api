import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { TransactionsRepository } from './repositories/transactions.repository';
import { TransactionSearchDto } from './dto/transaction-query.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
  ) {}

  async getAllTransactions(searchDto: TransactionSearchDto) {
    try {
      const [transactions, total] = await this.transactionsRepository.findTransactionsWithFilters(searchDto);

      const page = searchDto.page || 1;
      const limit = searchDto.limit || 10;
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Transactions retrieved successfully',
        data: {
          transactions: transactions.map(transaction => this.sanitizeTransactionData(transaction)),
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw new InternalServerErrorException('Failed to fetch transactions');
    }
  }

  async getTransactionsByYear(year: number, searchDto: TransactionSearchDto) {
    try {
      // Override the year filter
      const yearSearchDto = { ...searchDto, year };
      const [transactions, total] = await this.transactionsRepository.findTransactionsWithFilters(yearSearchDto);

      const page = searchDto.page || 1;
      const limit = searchDto.limit || 10;
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: `Transactions for year ${year} retrieved successfully`,
        data: {
          year,
          transactions: transactions.map(transaction => this.sanitizeTransactionData(transaction)),
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      };
    } catch (error) {
      console.error('Error fetching transactions by year:', error);
      throw new InternalServerErrorException('Failed to fetch transactions by year');
    }
  }

  async searchTransactions(searchDto: TransactionSearchDto) {
    try {
      const [transactions, total] = await this.transactionsRepository.findTransactionsWithFilters(searchDto);

      const page = searchDto.page || 1;
      const limit = searchDto.limit || 10;
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Transaction search completed successfully',
        data: {
          searchTerm: searchDto.search,
          transactions: transactions.map(transaction => this.sanitizeTransactionData(transaction)),
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      };
    } catch (error) {
      console.error('Error searching transactions:', error);
      throw new InternalServerErrorException('Failed to search transactions');
    }
  }

  async filterTransactions(searchDto: TransactionSearchDto) {
    try {
      const [transactions, total] = await this.transactionsRepository.findTransactionsWithFilters(searchDto);

      const page = searchDto.page || 1;
      const limit = searchDto.limit || 10;
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Transactions filtered successfully',
        data: {
          filters: this.getAppliedFilters(searchDto),
          transactions: transactions.map(transaction => this.sanitizeTransactionData(transaction)),
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      };
    } catch (error) {
      console.error('Error filtering transactions:', error);
      throw new InternalServerErrorException('Failed to filter transactions');
    }
  }

  async getTransactionById(id: string) {
    try {
      const transaction = await this.transactionsRepository.findTransactionById(id);

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      return {
        success: true,
        message: 'Transaction retrieved successfully',
        data: this.sanitizeTransactionData(transaction, true), // Include detailed info for individual view
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching transaction by ID:', error);
      throw new InternalServerErrorException('Failed to fetch transaction');
    }
  }

  async getTransactionStats() {
    try {
      const stats = await this.transactionsRepository.getTransactionStats();

      return {
        success: true,
        message: 'Transaction statistics retrieved successfully',
        data: stats,
      };
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      throw new InternalServerErrorException('Failed to fetch transaction statistics');
    }
  }

  async getTransactionStatsByYear(year: number) {
    try {
      const stats = await this.transactionsRepository.getTransactionStatsByYear(year);

      return {
        success: true,
        message: `Transaction statistics for year ${year} retrieved successfully`,
        data: stats,
      };
    } catch (error) {
      console.error('Error fetching transaction stats by year:', error);
      throw new InternalServerErrorException('Failed to fetch transaction statistics by year');
    }
  }

  async getTransactionsByUser(userId: string) {
    try {
      const transactions = await this.transactionsRepository.getTransactionsByUser(userId);

      return {
        success: true,
        message: 'User transactions retrieved successfully',
        data: {
          userId,
          transactions: transactions.map(transaction => this.sanitizeTransactionData(transaction)),
        },
      };
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      throw new InternalServerErrorException('Failed to fetch user transactions');
    }
  }

  async getTransactionsByHmo(hmoId: string) {
    try {
      const transactions = await this.transactionsRepository.getTransactionsByHmo(hmoId);

      return {
        success: true,
        message: 'HMO transactions retrieved successfully',
        data: {
          hmoId,
          transactions: transactions.map(transaction => this.sanitizeTransactionData(transaction)),
        },
      };
    } catch (error) {
      console.error('Error fetching HMO transactions:', error);
      throw new InternalServerErrorException('Failed to fetch HMO transactions');
    }
  }

  async getTransactionsByPlan(planId: string) {
    try {
      const transactions = await this.transactionsRepository.getTransactionsByPlan(planId);

      return {
        success: true,
        message: 'Plan transactions retrieved successfully',
        data: {
          planId,
          transactions: transactions.map(transaction => this.sanitizeTransactionData(transaction)),
        },
      };
    } catch (error) {
      console.error('Error fetching plan transactions:', error);
      throw new InternalServerErrorException('Failed to fetch plan transactions');
    }
  }

  async getRecentTransactions(limit: number = 10) {
    try {
      const transactions = await this.transactionsRepository.getRecentTransactions(limit);

      return {
        success: true,
        message: 'Recent transactions retrieved successfully',
        data: {
          transactions: transactions.map(transaction => this.sanitizeTransactionData(transaction)),
        },
      };
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw new InternalServerErrorException('Failed to fetch recent transactions');
    }
  }

  async getHighValueTransactions(minAmount: number = 100000) {
    try {
      const transactions = await this.transactionsRepository.getHighValueTransactions(minAmount);

      return {
        success: true,
        message: 'High value transactions retrieved successfully',
        data: {
          minAmount,
          transactions: transactions.map(transaction => this.sanitizeTransactionData(transaction)),
        },
      };
    } catch (error) {
      console.error('Error fetching high value transactions:', error);
      throw new InternalServerErrorException('Failed to fetch high value transactions');
    }
  }

  private sanitizeTransactionData(transaction: any, includeDetails = false) {
    const sanitized = {
      id: transaction.id,
      amount: transaction.amount,
      status: transaction.status,
      reference: transaction.reference,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      payments: transaction.payments ? transaction.payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        dueDate: payment.dueDate,
        receiptUrl: payment.receiptUrl,
        createdAt: payment.createdAt,
        user: payment.user ? {
          id: payment.user.id,
          firstName: payment.user.firstName,
          lastName: payment.user.lastName,
          email: payment.user.email,
          phoneNumber: payment.user.phoneNumber,
        } : null,
        paymentOption: payment.paymentOption ? {
          id: payment.paymentOption.id,
          name: payment.paymentOption.name,
          duration: payment.paymentOption.duration,
        } : null,
        subscriptions: payment.subscriptions ? payment.subscriptions.map(subscription => ({
          id: subscription.id,
          name: subscription.name,
          status: subscription.status,
          enrolleeNo: subscription.enrolleeNo,
          plan: subscription.plan ? {
            id: subscription.plan.id,
            name: subscription.plan.name,
            coverageType: subscription.plan.coverageType,
            pricingStructure: subscription.plan.pricingStructure,
          } : null,
        })) : [],
      })) : [],
    };

    // Include additional details for individual view
    if (includeDetails) {
      // sanitized.dependents = transaction.payments?.[0]?.subscriptions?.[0]?.dependents ?
      //   transaction.payments[0].subscriptions[0].dependents.map(dependent => ({
      //     id: dependent.id,
      //     firstName: dependent.firstName,
      //     lastName: dependent.lastName,
      //     relationship: dependent.relationship,
      //     dateOfBirth: dependent.dateOfBirth,
      //   })) : [];

      // sanitized.hmo = transaction.payments?.[0]?.user?.hmo ? {
      //   id: transaction.payments[0].user.hmo.id,
      //   name: transaction.payments[0].user.hmo.name,
      //   email: transaction.payments[0].user.hmo.email,
      // } : null;

      // sanitized.organization = transaction.payments?.[0]?.user?.organization ? {
      //   id: transaction.payments[0].user.organization.id,
      //   name: transaction.payments[0].user.organization.name,
      //   contactInfo: transaction.payments[0].user.organization.contactInfo,
      // } : null;

      // sanitized.wallet = transaction.payments?.[0]?.user?.wallet ? {
      //   id: transaction.payments[0].user.wallet.id,
      //   balance: transaction.payments[0].user.wallet.balance,
      // } : null;
    }

    return sanitized;
  }

  private getAppliedFilters(searchDto: TransactionSearchDto) {
    const filters: any = {};

    if (searchDto.status) filters.status = searchDto.status;
    if (searchDto.userId) filters.userId = searchDto.userId;
    if (searchDto.hmoId) filters.hmoId = searchDto.hmoId;
    if (searchDto.planId) filters.planId = searchDto.planId;
    if (searchDto.paymentMethod) filters.paymentMethod = searchDto.paymentMethod;
    if (searchDto.minAmount !== undefined) filters.minAmount = searchDto.minAmount;
    if (searchDto.maxAmount !== undefined) filters.maxAmount = searchDto.maxAmount;
    if (searchDto.startDate) filters.startDate = searchDto.startDate;
    if (searchDto.endDate) filters.endDate = searchDto.endDate;
    if (searchDto.year) filters.year = searchDto.year;
    if (searchDto.month) filters.month = searchDto.month;
    if (searchDto.transactionType) filters.transactionType = searchDto.transactionType;

    return filters;
  }
}
