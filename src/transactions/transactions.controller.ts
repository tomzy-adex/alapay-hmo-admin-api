import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { TransactionSearchDto } from './dto/transaction-query.dto';
import { AdminGuard } from '../utils/guards/admin.guard';
import { AuditInterceptor } from '../audit-log/audit-interceptor.service';
import { AuditLog } from '../utils/decorators/audit-log.decorator';

@ApiTags('Transactions')
@ApiBearerAuth('JWT')
@UseGuards(AdminGuard)
@UseInterceptors(AuditInterceptor)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Fetch all transactions',
    description: 'Retrieve all transactions with pagination, search, and filtering capabilities',
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Transactions retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            transactions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
                  amount: { type: 'number', example: 50000.00 },
                  status: { type: 'string', example: 'completed' },
                  reference: { type: 'string', example: 'TXN001' },
                  createdAt: { type: 'string', format: 'date-time' },
                  payments: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'payment-id' },
                        amount: { type: 'number', example: 50000.00 },
                        paymentMethod: { type: 'string', example: 'CARD' },
                        status: { type: 'string', example: 'completed' },
                        user: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: 'user-id' },
                            firstName: { type: 'string', example: 'John' },
                            lastName: { type: 'string', example: 'Doe' },
                            email: { type: 'string', example: 'john.doe@example.com' },
                          },
                        },
                        subscriptions: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string', example: 'subscription-id' },
                              name: { type: 'string', example: 'Premium Plan Subscription' },
                              enrolleeNo: { type: 'string', example: 'ENR001' },
                              plan: {
                                type: 'object',
                                properties: {
                                  id: { type: 'string', example: 'plan-id' },
                                  name: { type: 'string', example: 'Premium Health Plan' },
                                  coverageType: { type: 'string', example: 'Comprehensive' },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                total: { type: 'number', example: 100 },
                totalPages: { type: 'number', example: 10 },
                hasNext: { type: 'boolean', example: true },
                hasPrev: { type: 'boolean', example: false },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Get', 'Transactions')
  async getAllTransactions(@Query() searchDto: TransactionSearchDto) {
    return await this.transactionsService.getAllTransactions(searchDto);
  }

  @Get('year/:year')
  @ApiOperation({
    summary: 'Fetch all transactions by year',
    description: 'Retrieve all transactions for a specific year with filtering capabilities',
  })
  @ApiParam({
    name: 'year',
    description: 'Year to filter transactions',
    example: 2024,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions for year retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Transactions for year 2024 retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            year: { type: 'number', example: 2024 },
            transactions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'transaction-id' },
                  amount: { type: 'number', example: 50000.00 },
                  status: { type: 'string', example: 'completed' },
                  reference: { type: 'string', example: 'TXN001' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                total: { type: 'number', example: 50 },
                totalPages: { type: 'number', example: 5 },
                hasNext: { type: 'boolean', example: true },
                hasPrev: { type: 'boolean', example: false },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Get', 'Transactions by Year')
  async getTransactionsByYear(
    @Param('year') year: number,
    @Query() searchDto: TransactionSearchDto,
  ) {
    return await this.transactionsService.getTransactionsByYear(year, searchDto);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search all transactions',
    description: 'Search transactions by reference, user name, or email',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction search completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Transaction search completed successfully' },
        data: {
          type: 'object',
          properties: {
            searchTerm: { type: 'string', example: 'TXN001' },
            transactions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'transaction-id' },
                  amount: { type: 'number', example: 50000.00 },
                  status: { type: 'string', example: 'completed' },
                  reference: { type: 'string', example: 'TXN001' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                total: { type: 'number', example: 5 },
                totalPages: { type: 'number', example: 1 },
                hasNext: { type: 'boolean', example: false },
                hasPrev: { type: 'boolean', example: false },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Get', 'Transaction Search')
  async searchTransactions(@Query() searchDto: TransactionSearchDto) {
    return await this.transactionsService.searchTransactions(searchDto);
  }

  @Get('filter')
  @ApiOperation({
    summary: 'Filter transactions',
    description: 'Filter transactions by various criteria including status, amount range, date range, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions filtered successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Transactions filtered successfully' },
        data: {
          type: 'object',
          properties: {
            filters: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'completed' },
                minAmount: { type: 'number', example: 1000 },
                maxAmount: { type: 'number', example: 100000 },
                startDate: { type: 'string', example: '2024-01-01T00:00:00Z' },
                endDate: { type: 'string', example: '2024-12-31T23:59:59Z' },
              },
            },
            transactions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'transaction-id' },
                  amount: { type: 'number', example: 50000.00 },
                  status: { type: 'string', example: 'completed' },
                  reference: { type: 'string', example: 'TXN001' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                total: { type: 'number', example: 25 },
                totalPages: { type: 'number', example: 3 },
                hasNext: { type: 'boolean', example: true },
                hasPrev: { type: 'boolean', example: false },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Get', 'Transaction Filter')
  async filterTransactions(@Query() searchDto: TransactionSearchDto) {
    return await this.transactionsService.filterTransactions(searchDto);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get transaction statistics',
    description: 'Retrieve comprehensive statistics about all transactions',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Transaction statistics retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            totalTransactions: { type: 'number', example: 1000 },
            completedTransactions: { type: 'number', example: 800 },
            pendingTransactions: { type: 'number', example: 150 },
            failedTransactions: { type: 'number', example: 50 },
            totalAmount: { type: 'number', example: 50000000.00 },
            averageAmount: { type: 'number', example: 50000.00 },
            transactionsByStatus: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'completed' },
                  count: { type: 'number', example: 800 },
                  totalAmount: { type: 'number', example: 40000000.00 },
                },
              },
            },
            transactionsByMonth: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  year: { type: 'number', example: 2024 },
                  month: { type: 'number', example: 6 },
                  count: { type: 'number', example: 100 },
                  totalAmount: { type: 'number', example: 5000000.00 },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Get', 'Transaction Stats')
  async getTransactionStats() {
    return await this.transactionsService.getTransactionStats();
  }

  @Get('stats/year/:year')
  @ApiOperation({
    summary: 'Get transaction statistics by year',
    description: 'Retrieve comprehensive statistics about transactions for a specific year',
  })
  @ApiParam({
    name: 'year',
    description: 'Year to get statistics for',
    example: 2024,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction statistics for year retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Transaction statistics for year 2024 retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            year: { type: 'number', example: 2024 },
            totalTransactions: { type: 'number', example: 500 },
            completedTransactions: { type: 'number', example: 400 },
            pendingTransactions: { type: 'number', example: 80 },
            totalAmount: { type: 'number', example: 25000000.00 },
            averageAmount: { type: 'number', example: 50000.00 },
            transactionsByMonth: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  month: { type: 'number', example: 6 },
                  count: { type: 'number', example: 50 },
                  totalAmount: { type: 'number', example: 2500000.00 },
                },
              },
            },
            transactionsByStatus: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'completed' },
                  count: { type: 'number', example: 400 },
                  totalAmount: { type: 'number', example: 20000000.00 },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Get', 'Transaction Stats by Year')
  async getTransactionStatsByYear(@Param('year') year: number) {
    return await this.transactionsService.getTransactionStatsByYear(year);
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get transactions by user',
    description: 'Retrieve all transactions for a specific user',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'User transactions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User transactions retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            userId: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            transactions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'transaction-id' },
                  amount: { type: 'number', example: 50000.00 },
                  status: { type: 'string', example: 'completed' },
                  reference: { type: 'string', example: 'TXN001' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Get', 'User Transactions')
  async getTransactionsByUser(@Param('userId') userId: string) {
    return await this.transactionsService.getTransactionsByUser(userId);
  }

  @Get('hmo/:hmoId')
  @ApiOperation({
    summary: 'Get transactions by HMO',
    description: 'Retrieve all transactions for a specific HMO',
  })
  @ApiParam({
    name: 'hmoId',
    description: 'HMO ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'HMO transactions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'HMO transactions retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            hmoId: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            transactions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'transaction-id' },
                  amount: { type: 'number', example: 50000.00 },
                  status: { type: 'string', example: 'completed' },
                  reference: { type: 'string', example: 'TXN001' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Get', 'HMO Transactions')
  async getTransactionsByHmo(@Param('hmoId') hmoId: string) {
    return await this.transactionsService.getTransactionsByHmo(hmoId);
  }

  @Get('plan/:planId')
  @ApiOperation({
    summary: 'Get transactions by plan',
    description: 'Retrieve all transactions for a specific healthcare plan',
  })
  @ApiParam({
    name: 'planId',
    description: 'Plan ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Plan transactions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Plan transactions retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            planId: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            transactions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'transaction-id' },
                  amount: { type: 'number', example: 50000.00 },
                  status: { type: 'string', example: 'completed' },
                  reference: { type: 'string', example: 'TXN001' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Get', 'Plan Transactions')
  async getTransactionsByPlan(@Param('planId') planId: string) {
    return await this.transactionsService.getTransactionsByPlan(planId);
  }

  @Get('recent')
  @ApiOperation({
    summary: 'Get recent transactions',
    description: 'Retrieve the most recent transactions',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent transactions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Recent transactions retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            transactions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'transaction-id' },
                  amount: { type: 'number', example: 50000.00 },
                  status: { type: 'string', example: 'completed' },
                  reference: { type: 'string', example: 'TXN001' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Get', 'Recent Transactions')
  async getRecentTransactions() {
    return await this.transactionsService.getRecentTransactions(10);
  }

  @Get('high-value')
  @ApiOperation({
    summary: 'Get high value transactions',
    description: 'Retrieve transactions with amounts above a certain threshold',
  })
  @ApiResponse({
    status: 200,
    description: 'High value transactions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'High value transactions retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            minAmount: { type: 'number', example: 100000 },
            transactions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'transaction-id' },
                  amount: { type: 'number', example: 150000.00 },
                  status: { type: 'string', example: 'completed' },
                  reference: { type: 'string', example: 'TXN001' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Get', 'High Value Transactions')
  async getHighValueTransactions() {
    return await this.transactionsService.getHighValueTransactions(100000);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get transaction by ID',
    description: 'Retrieve detailed information about a specific transaction',
  })
  @ApiParam({
    name: 'id',
    description: 'Transaction ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Transaction retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            amount: { type: 'number', example: 50000.00 },
            status: { type: 'string', example: 'completed' },
            reference: { type: 'string', example: 'TXN001' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            payments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'payment-id' },
                  amount: { type: 'number', example: 50000.00 },
                  paymentMethod: { type: 'string', example: 'CARD' },
                  status: { type: 'string', example: 'completed' },
                  dueDate: { type: 'string', format: 'date' },
                  receiptUrl: { type: 'string', example: 'https://receipt.example.com' },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'user-id' },
                      firstName: { type: 'string', example: 'John' },
                      lastName: { type: 'string', example: 'Doe' },
                      email: { type: 'string', example: 'john.doe@example.com' },
                      phoneNumber: { type: 'string', example: '+2348012345678' },
                    },
                  },
                  subscriptions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'subscription-id' },
                        name: { type: 'string', example: 'Premium Plan Subscription' },
                        status: { type: 'string', example: 'active' },
                        enrolleeNo: { type: 'string', example: 'ENR001' },
                        plan: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: 'plan-id' },
                            name: { type: 'string', example: 'Premium Health Plan' },
                            coverageType: { type: 'string', example: 'Comprehensive' },
                            pricingStructure: { type: 'string', example: 'Monthly' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            dependents: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'dependent-id' },
                  firstName: { type: 'string', example: 'Jane' },
                  lastName: { type: 'string', example: 'Doe' },
                  relationship: { type: 'string', example: 'Spouse' },
                  enrolleeNo: { type: 'string', example: 'ENR002' },
                },
              },
            },
            hmo: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'hmo-id' },
                name: { type: 'string', example: 'Premium HMO' },
                email: { type: 'string', example: 'info@premiumhmo.com' },
                phoneNumber: { type: 'string', example: '+2348012345678' },
              },
            },
            organization: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'org-id' },
                name: { type: 'string', example: 'ABC Company' },
                email: { type: 'string', example: 'hr@abc.com' },
                phone: { type: 'string', example: '+2348012345678' },
              },
            },
            wallet: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'wallet-id' },
                balance: { type: 'number', example: 100000.00 },
                currency: { type: 'string', example: 'NGN' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Get', 'Transaction Detail')
  async getTransactionById(@Param('id') id: string) {
    return await this.transactionsService.getTransactionById(id);
  }
}
