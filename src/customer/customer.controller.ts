import {
  Controller,
  Get,
  Delete,
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
  ApiQuery,
} from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { CustomerSearchDto, CustomerFilterDto } from './dto/customer-query.dto';
import { AdminGuard } from '../utils/guards/admin.guard';
import { AuditInterceptor } from '../audit-log/audit-interceptor.service';
import { AuditLog } from '../utils/decorators/audit-log.decorator';

@ApiTags('Customers')
@ApiBearerAuth('JWT')
@UseGuards(AdminGuard)
@UseInterceptors(AuditInterceptor)
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @ApiOperation({
    summary: 'Fetch all customers',
    description: 'Retrieve all customers with pagination, search, and filtering capabilities',
  })
  @ApiResponse({
    status: 200,
    description: 'Customers retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Customers retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            customers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
                  firstName: { type: 'string', example: 'John' },
                  lastName: { type: 'string', example: 'Doe' },
                  email: { type: 'string', example: 'john.doe@example.com' },
                  phoneNumber: { type: 'string', example: '+2348012345678' },
                  status: { type: 'string', example: 'active' },
                  accountStatus: { type: 'string', example: 'approved' },
                  isEmailVerified: { type: 'boolean', example: true },
                  createdAt: { type: 'string', format: 'date-time' },
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
  @AuditLog('Get', 'Customers')
  async getAllCustomers(
    @Query() searchDto: CustomerSearchDto,
    @Query() filterDto: CustomerFilterDto,
  ) {
    return await this.customerService.getAllCustomers(searchDto, filterDto);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search customers',
    description: 'Search customers by name, email, or phone number with advanced filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer search completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Customer search completed successfully' },
        data: {
          type: 'object',
          properties: {
            customers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
                  firstName: { type: 'string', example: 'John' },
                  lastName: { type: 'string', example: 'Doe' },
                  email: { type: 'string', example: 'john.doe@example.com' },
                  phoneNumber: { type: 'string', example: '+2348012345678' },
                },
              },
            },
            searchTerm: { type: 'string', example: 'john' },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                total: { type: 'number', example: 5 },
                totalPages: { type: 'number', example: 1 },
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
  @AuditLog('Get', 'Customers Search')
  async searchCustomers(
    @Query() searchDto: CustomerSearchDto,
    @Query() filterDto: CustomerFilterDto,
  ) {
    return await this.customerService.searchCustomers(searchDto, filterDto);
  }

  @Get('filter')
  @ApiOperation({
    summary: 'Filter customers',
    description: 'Filter customers by various criteria including status, HMO, organization, and date ranges',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer filtering completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Customer filtering completed successfully' },
        data: {
          type: 'object',
          properties: {
            customers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
                  firstName: { type: 'string', example: 'John' },
                  lastName: { type: 'string', example: 'Doe' },
                  email: { type: 'string', example: 'john.doe@example.com' },
                  status: { type: 'string', example: 'active' },
                  accountStatus: { type: 'string', example: 'approved' },
                },
              },
            },
            filters: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'active' },
                hmoId: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
                startDate: { type: 'string', example: '2024-01-01' },
                endDate: { type: 'string', example: '2024-12-31' },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                total: { type: 'number', example: 25 },
                totalPages: { type: 'number', example: 3 },
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
  @AuditLog('Get', 'Customers Filter')
  async filterCustomers(
    @Query() searchDto: CustomerSearchDto,
    @Query() filterDto: CustomerFilterDto,
  ) {
    return await this.customerService.filterCustomers(searchDto, filterDto);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get customer statistics',
    description: 'Retrieve comprehensive statistics about customers including total, active, and verified counts',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Customer statistics retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            totalCustomers: { type: 'number', example: 1000 },
            activeCustomers: { type: 'number', example: 850 },
            verifiedCustomers: { type: 'number', example: 920 },
            inactiveCustomers: { type: 'number', example: 150 },
            unverifiedCustomers: { type: 'number', example: 80 },
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
  @AuditLog('Get', 'Customers Stats')
  async getCustomerStats() {
    return await this.customerService.getCustomerStats();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'View individual customer data',
    description: 'Retrieve detailed information about a specific customer including their claims, payments, and audit logs',
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Customer retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john.doe@example.com' },
            phoneNumber: { type: 'string', example: '+2348012345678' },
            dob: { type: 'string', format: 'date', example: '1990-01-01' },
            bloodGroup: { type: 'string', example: 'O+' },
            height: { type: 'number', example: 175 },
            genotype: { type: 'string', example: 'AA' },
            gender: { type: 'string', example: 'male' },
            isEmailVerified: { type: 'boolean', example: true },
            status: { type: 'string', example: 'approved' },
            accountStatus: { type: 'string', example: 'active' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            role: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
                permission: { type: 'string', example: 'individual-user' },
              },
            },
            hmo: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
                name: { type: 'string', example: 'Premium HMO' },
                email: { type: 'string', example: 'info@premiumhmo.com' },
                phoneNumber: { type: 'string', example: '+2348012345678' },
              },
            },
            wallet: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
                balance: { type: 'number', example: 50000.00 },
              },
            },
            claims: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
                  description: { type: 'string', example: 'Medical consultation' },
                  amount: { type: 'number', example: 15000.00 },
                  status: { type: 'string', example: 'pending' },
                  type: { type: 'string', example: 'medical' },
                  serviceDate: { type: 'string', format: 'date', example: '2024-01-15' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
            payments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
                  amount: { type: 'number', example: 50000.00 },
                  status: { type: 'string', example: 'completed' },
                  type: { type: 'string', example: 'subscription' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
            notifications: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
                  title: { type: 'string', example: 'Payment Successful' },
                  message: { type: 'string', example: 'Your payment has been processed successfully' },
                  isRead: { type: 'boolean', example: false },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
            auditLogs: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
                  action: { type: 'string', example: 'UPDATE' },
                  entityName: { type: 'string', example: 'User' },
                  entityId: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
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
    status: 404,
    description: 'Customer not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Get', 'Customer Detail')
  async getCustomerById(@Param('id') id: string) {
    return await this.customerService.getCustomerById(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete individual customer data',
    description: 'Soft delete a customer. Cannot delete customers with active claims or payments.',
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Customer deleted successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            email: { type: 'string', example: 'john.doe@example.com' },
            deletedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Cannot delete customer with active claims or payments',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Delete', 'Customer')
  async deleteCustomer(@Param('id') id: string) {
    return await this.customerService.deleteCustomer(id);
  }
}
