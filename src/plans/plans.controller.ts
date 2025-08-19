import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
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
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { PlanSearchDto, PlanSubscribersQueryDto } from './dto/plan-query.dto';
import { AdminGuard } from '../utils/guards/admin.guard';
import { AuditInterceptor } from '../audit-log/audit-interceptor.service';
import { AuditLog } from '../utils/decorators/audit-log.decorator';

@ApiTags('Plans')
@ApiBearerAuth('JWT')
@UseGuards(AdminGuard)
@UseInterceptors(AuditInterceptor)
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @ApiOperation({
    summary: 'Add new plan',
    description: 'Create a new healthcare plan with comprehensive details including benefits, account tiers, and hospitals',
  })
  @ApiResponse({
    status: 201,
    description: 'Plan created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Healthcare plan created successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            name: { type: 'string', example: 'Premium Health Plan' },
            coverageType: { type: 'string', example: 'Comprehensive' },
            pricingStructure: { type: 'string', example: 'Monthly' },
            familyPlanAvailable: { type: 'boolean', example: true },
            status: { type: 'string', example: 'active' },
            createdAt: { type: 'string', format: 'date-time' },
            hmo: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'hmo-id' },
                name: { type: 'string', example: 'Premium HMO' },
                email: { type: 'string', example: 'info@premiumhmo.com' },
              },
            },
            accountTiers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'tier-id' },
                  name: { type: 'string', example: 'Gold' },
                  premium: { type: 'number', example: 50000.00 },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation error or invalid data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Plan name already exists for this HMO',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Post', 'Plans')
  async createPlan(@Body() payload: CreatePlanDto) {
    return await this.plansService.createPlan(payload);
  }

  @Get()
  @ApiOperation({
    summary: 'Fetch plans',
    description: 'Retrieve all healthcare plans with pagination, search, and filtering capabilities',
  })
  @ApiResponse({
    status: 200,
    description: 'Plans retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Plans retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            plans: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
                  name: { type: 'string', example: 'Premium Health Plan' },
                  coverageType: { type: 'string', example: 'Comprehensive' },
                  pricingStructure: { type: 'string', example: 'Monthly' },
                  familyPlanAvailable: { type: 'boolean', example: true },
                  status: { type: 'string', example: 'active' },
                  createdAt: { type: 'string', format: 'date-time' },
                  hmo: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'hmo-id' },
                      name: { type: 'string', example: 'Premium HMO' },
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
  @AuditLog('Get', 'Plans')
  async getAllPlans(@Query() searchDto: PlanSearchDto) {
    return await this.plansService.getAllPlans(searchDto);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get plan statistics',
    description: 'Retrieve comprehensive statistics about all healthcare plans',
  })
  @ApiResponse({
    status: 200,
    description: 'Plan statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Plan statistics retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            totalPlans: { type: 'number', example: 50 },
            activePlans: { type: 'number', example: 35 },
            inactivePlans: { type: 'number', example: 15 },
            familyPlans: { type: 'number', example: 20 },
            individualPlans: { type: 'number', example: 30 },
            plansByCoverageType: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  coverageType: { type: 'string', example: 'Comprehensive' },
                  count: { type: 'number', example: 25 },
                },
              },
            },
            plansByPricingStructure: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  pricingStructure: { type: 'string', example: 'Monthly' },
                  count: { type: 'number', example: 30 },
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
  @AuditLog('Get', 'Plans Stats')
  async getPlanStats() {
    return await this.plansService.getPlanStats();
  }

  @Get('hmo/:hmoId')
  @ApiOperation({
    summary: 'Get plans by HMO',
    description: 'Retrieve all plans belonging to a specific HMO',
  })
  @ApiParam({
    name: 'hmoId',
    description: 'HMO ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'HMO plans retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'HMO plans retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            hmoId: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            plans: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'plan-id' },
                  name: { type: 'string', example: 'Premium Health Plan' },
                  coverageType: { type: 'string', example: 'Comprehensive' },
                  status: { type: 'string', example: 'active' },
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
  @AuditLog('Get', 'HMO Plans')
  async getPlansByHmo(@Param('hmoId') hmoId: string) {
    return await this.plansService.getPlansByHmo(hmoId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get plan by ID',
    description: 'Retrieve detailed information about a specific healthcare plan',
  })
  @ApiParam({
    name: 'id',
    description: 'Plan ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Plan retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Plan retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            name: { type: 'string', example: 'Premium Health Plan' },
            coverageType: { type: 'string', example: 'Comprehensive' },
            pricingStructure: { type: 'string', example: 'Monthly' },
            familyPlanAvailable: { type: 'boolean', example: true },
            dependentDiscountRate: { type: 'number', example: 20 },
            maxDependents: { type: 'number', example: 5 },
            planBenefits: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Doctor Consultation' },
                  description: { type: 'string', example: 'Unlimited consultations' },
                  limit: { type: 'number', example: 100000 },
                  percentage: { type: 'number', example: 80 },
                },
              },
            },
            status: { type: 'string', example: 'active' },
            minimumUsersRequired: { type: 'number', example: 10 },
            minimumPremiumRequired: { type: 'number', example: 50000.00 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            hmo: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'hmo-id' },
                name: { type: 'string', example: 'Premium HMO' },
                email: { type: 'string', example: 'info@premiumhmo.com' },
                phoneNumber: { type: 'string', example: '+2348012345678' },
              },
            },
            accountTiers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'tier-id' },
                  name: { type: 'string', example: 'Gold' },
                  premium: { type: 'number', example: 50000.00 },
                  coverageDetails: { type: 'string', example: 'Comprehensive coverage' },
                },
              },
            },
            hospitals: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'hospital-id' },
                  name: { type: 'string', example: 'General Hospital' },
                  address: { type: 'string', example: '123 Main St' },
                  phone: { type: 'string', example: '+2348012345678' },
                  email: { type: 'string', example: 'info@generalhospital.com' },
                },
              },
            },
            paymentOptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'option-id' },
                  name: { type: 'string', example: 'Monthly' },
                  duration: { type: 'string', example: 'Monthly' },
                },
              },
            },
            subscriptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'subscription-id' },
                  name: { type: 'string', example: 'John Doe Subscription' },
                  status: { type: 'string', example: 'active' },
                  enrolleeNo: { type: 'string', example: 'ENR001' },
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
    description: 'Plan not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Get', 'Plan Detail')
  async getPlanById(@Param('id') id: string) {
    return await this.plansService.getPlanById(id);
  }

  @Get(':id/subscribers')
  @ApiOperation({
    summary: 'Fetch subscribers to plan',
    description: 'Retrieve all subscribers for a specific healthcare plan with pagination and filtering',
  })
  @ApiParam({
    name: 'id',
    description: 'Plan ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Plan subscribers retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Plan subscribers retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            plan: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'plan-id' },
                name: { type: 'string', example: 'Premium Health Plan' },
                coverageType: { type: 'string', example: 'Comprehensive' },
              },
            },
            subscribers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'subscription-id' },
                  name: { type: 'string', example: 'John Doe Subscription' },
                  status: { type: 'string', example: 'active' },
                  enrolleeNo: { type: 'string', example: 'ENR001' },
                  createdAt: { type: 'string', format: 'date-time' },
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
                  dependents: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'dependent-id' },
                        firstName: { type: 'string', example: 'Jane' },
                        lastName: { type: 'string', example: 'Doe' },
                        relationship: { type: 'string', example: 'spouse' },
                        enrolleeNo: { type: 'string', example: 'ENR001-DEP001' },
                      },
                    },
                  },
                  payment: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'payment-id' },
                      amount: { type: 'number', example: 50000.00 },
                      status: { type: 'string', example: 'completed' },
                      type: { type: 'string', example: 'subscription' },
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
    status: 404,
    description: 'Plan not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Get', 'Plan Subscribers')
  async getPlanSubscribers(
    @Param('id') id: string,
    @Query() queryDto: PlanSubscribersQueryDto,
  ) {
    return await this.plansService.getPlanSubscribers(id, queryDto);
  }

  @Get(':id/subscribers/stats')
  @ApiOperation({
    summary: 'Get plan subscriber statistics',
    description: 'Retrieve statistics about subscribers for a specific healthcare plan',
  })
  @ApiParam({
    name: 'id',
    description: 'Plan ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Plan subscriber statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Plan subscriber statistics retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            plan: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'plan-id' },
                name: { type: 'string', example: 'Premium Health Plan' },
              },
            },
            totalSubscribers: { type: 'number', example: 100 },
            activeSubscribers: { type: 'number', example: 85 },
            inactiveSubscribers: { type: 'number', example: 15 },
            totalDependents: { type: 'number', example: 250 },
            averageDependentsPerSubscriber: { type: 'number', example: 2.5 },
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
    description: 'Plan not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Get', 'Plan Subscriber Stats')
  async getPlanSubscriberStats(@Param('id') id: string) {
    return await this.plansService.getPlanSubscriberStats(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete plan',
    description: 'Soft delete a healthcare plan. Cannot delete plans with active subscriptions.',
  })
  @ApiParam({
    name: 'id',
    description: 'Plan ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Plan deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Plan deleted successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            name: { type: 'string', example: 'Premium Health Plan' },
            deletedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Cannot delete plan with active subscriptions',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Plan not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Delete', 'Plan')
  async deletePlan(@Param('id') id: string) {
    return await this.plansService.deletePlan(id);
  }
}
