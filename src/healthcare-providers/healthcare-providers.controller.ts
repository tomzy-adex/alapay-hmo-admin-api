import {
  Controller,
  Get,
  Post,
  Put,
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
} from '@nestjs/swagger';
import { HealthcareProvidersService } from './healthcare-providers.service';
import { CreateHcpDto } from './dto/create-hcp.dto';
import { UpdateHcpDto } from './dto/update-hcp.dto';
import { HcpSearchDto } from './dto/hcp-query.dto';
import { AdminGuard } from '../utils/guards/admin.guard';
import { AuditInterceptor } from '../audit-log/audit-interceptor.service';
import { AuditLog } from '../utils/decorators/audit-log.decorator';

@ApiTags('Healthcare Providers')
@ApiBearerAuth('JWT')
@UseGuards(AdminGuard)
@UseInterceptors(AuditInterceptor)
@Controller('healthcare-providers')
export class HealthcareProvidersController {
  constructor(private readonly hcpService: HealthcareProvidersService) {}

  @Post()
  @ApiOperation({
    summary: 'Add new HCP',
    description: 'Create a new healthcare provider with comprehensive details including contact info, facility info, and affiliations',
  })
  @ApiResponse({
    status: 201,
    description: 'HCP created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Healthcare provider created successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            name: { type: 'string', example: 'City General Hospital' },
            address: { type: 'string', example: '123 Healthcare Avenue, Medical District, Lagos' },
            email: { type: 'string', example: 'contact@citygeneral.com' },
            phone: { type: 'string', example: '+2348012345678' },
            emergencyServiceProvider: { type: 'boolean', example: true },
            status: { type: 'string', example: 'pending' },
            createdAt: { type: 'string', format: 'date-time' },
            plans: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'plan-id' },
                  name: { type: 'string', example: 'Premium Health Plan' },
                  coverageType: { type: 'string', example: 'Comprehensive' },
                },
              },
            },
            hmos: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'hmo-id' },
                  name: { type: 'string', example: 'Premium HMO' },
                  email: { type: 'string', example: 'info@premiumhmo.com' },
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
    description: 'Conflict - HCP name or email already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Post', 'Healthcare Providers')
  async createHcp(@Body() payload: CreateHcpDto) {
    return await this.hcpService.createHcp(payload);
  }

  @Get()
  @ApiOperation({
    summary: 'Fetch HCP',
    description: 'Retrieve all healthcare providers with pagination, search, and filtering capabilities',
  })
  @ApiResponse({
    status: 200,
    description: 'HCPs retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Healthcare providers retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            hcps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
                  name: { type: 'string', example: 'City General Hospital' },
                  address: { type: 'string', example: '123 Healthcare Avenue, Medical District, Lagos' },
                  email: { type: 'string', example: 'contact@citygeneral.com' },
                  phone: { type: 'string', example: '+2348012345678' },
                  emergencyServiceProvider: { type: 'boolean', example: true },
                  status: { type: 'string', example: 'approved' },
                  accountStatus: { type: 'string', example: 'active' },
                  createdAt: { type: 'string', format: 'date-time' },
                  plans: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'plan-id' },
                        name: { type: 'string', example: 'Premium Health Plan' },
                        coverageType: { type: 'string', example: 'Comprehensive' },
                      },
                    },
                  },
                  hmos: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'hmo-id' },
                        name: { type: 'string', example: 'Premium HMO' },
                        email: { type: 'string', example: 'info@premiumhmo.com' },
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
  @AuditLog('Get', 'Healthcare Providers')
  async getAllHcps(@Query() searchDto: HcpSearchDto) {
    return await this.hcpService.getAllHcps(searchDto);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get HCP statistics',
    description: 'Retrieve comprehensive statistics about all healthcare providers',
  })
  @ApiResponse({
    status: 200,
    description: 'HCP statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Healthcare provider statistics retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            totalHcps: { type: 'number', example: 100 },
            activeHcps: { type: 'number', example: 75 },
            inactiveHcps: { type: 'number', example: 25 },
            approvedHcps: { type: 'number', example: 80 },
            pendingHcps: { type: 'number', example: 20 },
            emergencyProviders: { type: 'number', example: 30 },
            nonEmergencyProviders: { type: 'number', example: 70 },
            hcpsByType: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  facilityType: { type: 'string', example: 'General Hospital' },
                  count: { type: 'number', example: 40 },
                },
              },
            },
            hcpsByStatus: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'approved' },
                  count: { type: 'number', example: 80 },
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
  @AuditLog('Get', 'HCP Stats')
  async getHcpStats() {
    return await this.hcpService.getHcpStats();
  }

  @Get('emergency')
  @ApiOperation({
    summary: 'Get emergency providers',
    description: 'Retrieve all healthcare providers that offer emergency services',
  })
  @ApiResponse({
    status: 200,
    description: 'Emergency providers retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Emergency healthcare providers retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            hcps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'hcp-id' },
                  name: { type: 'string', example: 'Emergency Medical Center' },
                  address: { type: 'string', example: '456 Emergency Lane' },
                  email: { type: 'string', example: 'emergency@emc.com' },
                  phone: { type: 'string', example: '+2348012345678' },
                  emergencyServiceProvider: { type: 'boolean', example: true },
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
  @AuditLog('Get', 'Emergency Providers')
  async getEmergencyProviders() {
    return await this.hcpService.getEmergencyProviders();
  }

  @Get('hmo/:hmoId')
  @ApiOperation({
    summary: 'Get HCPs by HMO',
    description: 'Retrieve all healthcare providers affiliated with a specific HMO',
  })
  @ApiParam({
    name: 'hmoId',
    description: 'HMO ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'HMO HCPs retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'HMO healthcare providers retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            hmoId: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            hcps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'hcp-id' },
                  name: { type: 'string', example: 'City General Hospital' },
                  address: { type: 'string', example: '123 Healthcare Avenue' },
                  email: { type: 'string', example: 'contact@citygeneral.com' },
                  phone: { type: 'string', example: '+2348012345678' },
                  status: { type: 'string', example: 'approved' },
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
  @AuditLog('Get', 'HMO HCPs')
  async getHcpsByHmo(@Param('hmoId') hmoId: string) {
    return await this.hcpService.getHcpsByHmo(hmoId);
  }

  @Get('plan/:planId')
  @ApiOperation({
    summary: 'Get HCPs by plan',
    description: 'Retrieve all healthcare providers that accept a specific healthcare plan',
  })
  @ApiParam({
    name: 'planId',
    description: 'Plan ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Plan HCPs retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Plan healthcare providers retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            planId: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            hcps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'hcp-id' },
                  name: { type: 'string', example: 'City General Hospital' },
                  address: { type: 'string', example: '123 Healthcare Avenue' },
                  email: { type: 'string', example: 'contact@citygeneral.com' },
                  phone: { type: 'string', example: '+2348012345678' },
                  status: { type: 'string', example: 'approved' },
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
  @AuditLog('Get', 'Plan HCPs')
  async getHcpsByPlan(@Param('planId') planId: string) {
    return await this.hcpService.getHcpsByPlan(planId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Fetch HCP by id',
    description: 'Retrieve detailed information about a specific healthcare provider',
  })
  @ApiParam({
    name: 'id',
    description: 'HCP ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'HCP retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Healthcare provider retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            name: { type: 'string', example: 'City General Hospital' },
            address: { type: 'string', example: '123 Healthcare Avenue, Medical District, Lagos' },
            email: { type: 'string', example: 'contact@citygeneral.com' },
            phone: { type: 'string', example: '+2348012345678' },
            emergencyServiceProvider: { type: 'boolean', example: true },
            status: { type: 'string', example: 'approved' },
            accountStatus: { type: 'string', example: 'active' },
            verificationComments: { type: 'string', example: 'Provider verified and approved' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            plans: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'plan-id' },
                  name: { type: 'string', example: 'Premium Health Plan' },
                  coverageType: { type: 'string', example: 'Comprehensive' },
                  pricingStructure: { type: 'string', example: 'Monthly' },
                },
              },
            },
            hmos: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'hmo-id' },
                  name: { type: 'string', example: 'Premium HMO' },
                  email: { type: 'string', example: 'info@premiumhmo.com' },
                  phoneNumber: { type: 'string', example: '+2348012345678' },
                },
              },
            },
            enrollments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'enrollment-id' },
                  startDate: { type: 'string', format: 'date' },
                  endDate: { type: 'string', format: 'date' },
                  status: { type: 'string', example: 'active' },
                  terms: { type: 'object' },
                },
              },
            },
            ratings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'rating-id' },
                  rating: { type: 'number', example: 4.5 },
                  review: { type: 'string', example: 'Excellent service' },
                  metrics: { type: 'object' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
            services: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'service-id' },
                  name: { type: 'string', example: 'Cardiology Consultation' },
                  description: { type: 'string', example: 'Specialized heart care' },
                  basePrice: { type: 'number', example: 50000.00 },
                  coverageDetails: { type: 'object' },
                },
              },
            },
            providerClaims: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'claim-id' },
                  enrolleeNo: { type: 'string', example: 'ENR001' },
                  claimReference: { type: 'string', example: 'CLM001' },
                  status: { type: 'string', example: 'pending' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
            users: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'user-id' },
                  firstName: { type: 'string', example: 'John' },
                  lastName: { type: 'string', example: 'Doe' },
                  email: { type: 'string', example: 'john.doe@example.com' },
                  phoneNumber: { type: 'string', example: '+2348012345678' },
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
    description: 'HCP not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Get', 'HCP Detail')
  async getHcpById(@Param('id') id: string) {
    return await this.hcpService.getHcpById(id);
  }

  @Get(':id/enrollment-stats')
  @ApiOperation({
    summary: 'Get HCP enrollment statistics',
    description: 'Retrieve statistics about enrollments, ratings, services, and claims for a specific healthcare provider',
  })
  @ApiParam({
    name: 'id',
    description: 'HCP ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'HCP enrollment statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Healthcare provider enrollment statistics retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            hcp: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'hcp-id' },
                name: { type: 'string', example: 'City General Hospital' },
              },
            },
            totalEnrollments: { type: 'number', example: 25 },
            activeEnrollments: { type: 'number', example: 20 },
            inactiveEnrollments: { type: 'number', example: 5 },
            totalRatings: { type: 'number', example: 150 },
            averageRating: { type: 'number', example: 4.2 },
            totalServices: { type: 'number', example: 30 },
            totalClaims: { type: 'number', example: 500 },
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
    description: 'HCP not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Get', 'HCP Enrollment Stats')
  async getHcpEnrollmentStats(@Param('id') id: string) {
    return await this.hcpService.getHcpEnrollmentStats(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update HCP',
    description: 'Update an existing healthcare provider with new information',
  })
  @ApiParam({
    name: 'id',
    description: 'HCP ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'HCP updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Healthcare provider updated successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            name: { type: 'string', example: 'City General Hospital' },
            address: { type: 'string', example: '123 Healthcare Avenue, Medical District, Lagos' },
            email: { type: 'string', example: 'contact@citygeneral.com' },
            phone: { type: 'string', example: '+2348012345678' },
            emergencyServiceProvider: { type: 'boolean', example: true },
            status: { type: 'string', example: 'approved' },
            accountStatus: { type: 'string', example: 'active' },
            updatedAt: { type: 'string', format: 'date-time' },
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
    status: 404,
    description: 'HCP not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - HCP name or email already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Put', 'Healthcare Provider')
  async updateHcp(@Param('id') id: string, @Body() payload: UpdateHcpDto) {
    return await this.hcpService.updateHcp(id, payload);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete HCP',
    description: 'Soft delete a healthcare provider. Cannot delete HCPs with active enrollments or claims.',
  })
  @ApiParam({
    name: 'id',
    description: 'HCP ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'HCP deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Healthcare provider deleted successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            name: { type: 'string', example: 'City General Hospital' },
            deletedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Cannot delete HCP with active enrollments or claims',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'HCP not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Delete', 'Healthcare Provider')
  async deleteHcp(@Param('id') id: string) {
    return await this.hcpService.deleteHcp(id);
  }
}
