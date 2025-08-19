import {
  Controller,
  Get,
  Post,
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
import { TreatmentClaimsService } from './treatment-claims.service';
import { TreatmentClaimSearchDto } from './dto/treatment-claim-query.dto';
import { ApproveDeclineClaimDto } from './dto/approve-decline-claim.dto';
import { AdminGuard } from '../utils/guards/admin.guard';
import { AuditInterceptor } from '../audit-log/audit-interceptor.service';
import { AuditLog } from '../utils/decorators/audit-log.decorator';

@ApiTags('Treatment Claims')
@ApiBearerAuth('JWT')
@UseGuards(AdminGuard)
@UseInterceptors(AuditInterceptor)
@Controller('treatment-claims')
export class TreatmentClaimsController {
  constructor(private readonly treatmentClaimsService: TreatmentClaimsService) {}

  @Get()
  @ApiOperation({
    summary: 'Fetch all treatment claims',
    description: 'Retrieve all treatment claims with pagination, search, and filtering capabilities',
  })
  @ApiResponse({
    status: 200,
    description: 'Treatment claims retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Treatment claims retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            claims: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
                  type: { type: 'string', example: 'medical' },
                  description: { type: 'string', example: 'Annual medical checkup' },
                  amount: { type: 'number', example: 50000.00 },
                  status: { type: 'string', example: 'pending' },
                  serviceDate: { type: 'string', format: 'date' },
                  providerReference: { type: 'string', example: 'REF123456' },
                  createdAt: { type: 'string', format: 'date-time' },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'user-id' },
                      firstName: { type: 'string', example: 'John' },
                      lastName: { type: 'string', example: 'Doe' },
                      email: { type: 'string', example: 'john.doe@example.com' },
                    },
                  },
                  hospital: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'hospital-id' },
                      name: { type: 'string', example: 'City General Hospital' },
                      address: { type: 'string', example: '123 Healthcare Avenue' },
                    },
                  },
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
  @AuditLog('Get', 'Treatment Claims')
  async getAllTreatmentClaims(@Query() searchDto: TreatmentClaimSearchDto) {
    return await this.treatmentClaimsService.getAllTreatmentClaims(searchDto);
  }

  @Get('year/:year')
  @ApiOperation({
    summary: 'Fetch all treatment claims by year',
    description: 'Retrieve all treatment claims for a specific year with filtering capabilities',
  })
  @ApiParam({
    name: 'year',
    description: 'Year to filter treatment claims',
    example: 2024,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Treatment claims for year retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Treatment claims for year 2024 retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            year: { type: 'number', example: 2024 },
            claims: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'claim-id' },
                  type: { type: 'string', example: 'medical' },
                  description: { type: 'string', example: 'Annual medical checkup' },
                  amount: { type: 'number', example: 50000.00 },
                  status: { type: 'string', example: 'pending' },
                  serviceDate: { type: 'string', format: 'date' },
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
  @AuditLog('Get', 'Treatment Claims by Year')
  async getTreatmentClaimsByYear(
    @Param('year') year: number,
    @Query() searchDto: TreatmentClaimSearchDto,
  ) {
    return await this.treatmentClaimsService.getTreatmentClaimsByYear(year, searchDto);
  }

  @Get('filter-export')
  @ApiOperation({
    summary: 'Filter and export treatment claims',
    description: 'Filter treatment claims and prepare export in various formats (CSV, Excel, PDF)',
  })
  @ApiResponse({
    status: 200,
    description: 'Treatment claims filtered and export prepared successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Treatment claims filtered and export prepared successfully' },
        data: {
          type: 'object',
          properties: {
            filters: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'pending' },
                minAmount: { type: 'number', example: 1000 },
                maxAmount: { type: 'number', example: 100000 },
              },
            },
            claims: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'claim-id' },
                  type: { type: 'string', example: 'medical' },
                  description: { type: 'string', example: 'Annual medical checkup' },
                  amount: { type: 'number', example: 50000.00 },
                  status: { type: 'string', example: 'pending' },
                },
              },
            },
            export: {
              type: 'object',
              properties: {
                format: { type: 'string', example: 'csv' },
                filename: { type: 'string', example: 'treatment-claims-2024-01-15.csv' },
                data: { type: 'object' },
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
  @AuditLog('Get', 'Treatment Claims Filter Export')
  async filterAndExportTreatmentClaims(@Query() searchDto: TreatmentClaimSearchDto) {
    return await this.treatmentClaimsService.filterAndExportTreatmentClaims(searchDto);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get treatment claim statistics',
    description: 'Retrieve comprehensive statistics about all treatment claims',
  })
  @ApiResponse({
    status: 200,
    description: 'Treatment claim statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Treatment claim statistics retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            totalClaims: { type: 'number', example: 1000 },
            pendingClaims: { type: 'number', example: 200 },
            approvedClaims: { type: 'number', example: 700 },
            rejectedClaims: { type: 'number', example: 100 },
            totalAmount: { type: 'number', example: 50000000.00 },
            averageAmount: { type: 'number', example: 50000.00 },
            claimsByStatus: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'pending' },
                  count: { type: 'number', example: 200 },
                  totalAmount: { type: 'number', example: 10000000.00 },
                },
              },
            },
            claimsByType: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', example: 'medical' },
                  count: { type: 'number', example: 800 },
                  totalAmount: { type: 'number', example: 40000000.00 },
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
  @AuditLog('Get', 'Treatment Claims Stats')
  async getTreatmentClaimStats() {
    return await this.treatmentClaimsService.getTreatmentClaimStats();
  }

  @Get('stats/year/:year')
  @ApiOperation({
    summary: 'Get treatment claim statistics by year',
    description: 'Retrieve comprehensive statistics about treatment claims for a specific year',
  })
  @ApiParam({
    name: 'year',
    description: 'Year to get statistics for',
    example: 2024,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Treatment claim statistics for year retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Treatment claim statistics for year 2024 retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            year: { type: 'number', example: 2024 },
            totalClaims: { type: 'number', example: 500 },
            pendingClaims: { type: 'number', example: 100 },
            approvedClaims: { type: 'number', example: 350 },
            rejectedClaims: { type: 'number', example: 50 },
            totalAmount: { type: 'number', example: 25000000.00 },
            averageAmount: { type: 'number', example: 50000.00 },
            claimsByMonth: {
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
  @AuditLog('Get', 'Treatment Claims Stats by Year')
  async getTreatmentClaimStatsByYear(@Param('year') year: number) {
    return await this.treatmentClaimsService.getTreatmentClaimStatsByYear(year);
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get treatment claims by user',
    description: 'Retrieve all treatment claims for a specific user',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'User treatment claims retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User treatment claims retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            userId: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            claims: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'claim-id' },
                  type: { type: 'string', example: 'medical' },
                  description: { type: 'string', example: 'Annual medical checkup' },
                  amount: { type: 'number', example: 50000.00 },
                  status: { type: 'string', example: 'pending' },
                  serviceDate: { type: 'string', format: 'date' },
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
  @AuditLog('Get', 'User Treatment Claims')
  async getTreatmentClaimsByUser(@Param('userId') userId: string) {
    return await this.treatmentClaimsService.getTreatmentClaimsByUser(userId);
  }

  @Get('hmo/:hmoId')
  @ApiOperation({
    summary: 'Get treatment claims by HMO',
    description: 'Retrieve all treatment claims for a specific HMO',
  })
  @ApiParam({
    name: 'hmoId',
    description: 'HMO ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'HMO treatment claims retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'HMO treatment claims retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            hmoId: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            claims: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'claim-id' },
                  type: { type: 'string', example: 'medical' },
                  description: { type: 'string', example: 'Annual medical checkup' },
                  amount: { type: 'number', example: 50000.00 },
                  status: { type: 'string', example: 'pending' },
                  serviceDate: { type: 'string', format: 'date' },
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
  @AuditLog('Get', 'HMO Treatment Claims')
  async getTreatmentClaimsByHmo(@Param('hmoId') hmoId: string) {
    return await this.treatmentClaimsService.getTreatmentClaimsByHmo(hmoId);
  }

  @Get('hospital/:hospitalId')
  @ApiOperation({
    summary: 'Get treatment claims by hospital',
    description: 'Retrieve all treatment claims for a specific hospital',
  })
  @ApiParam({
    name: 'hospitalId',
    description: 'Hospital ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Hospital treatment claims retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Hospital treatment claims retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            hospitalId: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            claims: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'claim-id' },
                  type: { type: 'string', example: 'medical' },
                  description: { type: 'string', example: 'Annual medical checkup' },
                  amount: { type: 'number', example: 50000.00 },
                  status: { type: 'string', example: 'pending' },
                  serviceDate: { type: 'string', format: 'date' },
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
  @AuditLog('Get', 'Hospital Treatment Claims')
  async getTreatmentClaimsByHospital(@Param('hospitalId') hospitalId: string) {
    return await this.treatmentClaimsService.getTreatmentClaimsByHospital(hospitalId);
  }

  @Get('recent')
  @ApiOperation({
    summary: 'Get recent treatment claims',
    description: 'Retrieve the most recent treatment claims',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent treatment claims retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Recent treatment claims retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            claims: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'claim-id' },
                  type: { type: 'string', example: 'medical' },
                  description: { type: 'string', example: 'Annual medical checkup' },
                  amount: { type: 'number', example: 50000.00 },
                  status: { type: 'string', example: 'pending' },
                  serviceDate: { type: 'string', format: 'date' },
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
  @AuditLog('Get', 'Recent Treatment Claims')
  async getRecentTreatmentClaims() {
    return await this.treatmentClaimsService.getRecentTreatmentClaims(10);
  }

  @Get('high-value')
  @ApiOperation({
    summary: 'Get high value treatment claims',
    description: 'Retrieve treatment claims with amounts above a certain threshold',
  })
  @ApiResponse({
    status: 200,
    description: 'High value treatment claims retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'High value treatment claims retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            minAmount: { type: 'number', example: 100000 },
            claims: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'claim-id' },
                  type: { type: 'string', example: 'medical' },
                  description: { type: 'string', example: 'Major surgery' },
                  amount: { type: 'number', example: 150000.00 },
                  status: { type: 'string', example: 'pending' },
                  serviceDate: { type: 'string', format: 'date' },
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
  @AuditLog('Get', 'High Value Treatment Claims')
  async getHighValueTreatmentClaims() {
    return await this.treatmentClaimsService.getHighValueTreatmentClaims(100000);
  }

  @Get('pending')
  @ApiOperation({
    summary: 'Get pending treatment claims',
    description: 'Retrieve all pending treatment claims',
  })
  @ApiResponse({
    status: 200,
    description: 'Pending treatment claims retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Pending treatment claims retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            claims: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'claim-id' },
                  type: { type: 'string', example: 'medical' },
                  description: { type: 'string', example: 'Annual medical checkup' },
                  amount: { type: 'number', example: 50000.00 },
                  status: { type: 'string', example: 'pending' },
                  serviceDate: { type: 'string', format: 'date' },
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
  @AuditLog('Get', 'Pending Treatment Claims')
  async getPendingTreatmentClaims() {
    return await this.treatmentClaimsService.getPendingTreatmentClaims();
  }

  @Get('approved')
  @ApiOperation({
    summary: 'Get approved treatment claims',
    description: 'Retrieve all approved treatment claims',
  })
  @ApiResponse({
    status: 200,
    description: 'Approved treatment claims retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Approved treatment claims retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            claims: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'claim-id' },
                  type: { type: 'string', example: 'medical' },
                  description: { type: 'string', example: 'Annual medical checkup' },
                  amount: { type: 'number', example: 50000.00 },
                  status: { type: 'string', example: 'approved' },
                  serviceDate: { type: 'string', format: 'date' },
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
  @AuditLog('Get', 'Approved Treatment Claims')
  async getApprovedTreatmentClaims() {
    return await this.treatmentClaimsService.getApprovedTreatmentClaims();
  }

  @Get('rejected')
  @ApiOperation({
    summary: 'Get rejected treatment claims',
    description: 'Retrieve all rejected treatment claims',
  })
  @ApiResponse({
    status: 200,
    description: 'Rejected treatment claims retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Rejected treatment claims retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            claims: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'claim-id' },
                  type: { type: 'string', example: 'medical' },
                  description: { type: 'string', example: 'Annual medical checkup' },
                  amount: { type: 'number', example: 50000.00 },
                  status: { type: 'string', example: 'rejected' },
                  rejectionReason: { type: 'string', example: 'Service not covered under plan' },
                  serviceDate: { type: 'string', format: 'date' },
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
  @AuditLog('Get', 'Rejected Treatment Claims')
  async getRejectedTreatmentClaims() {
    return await this.treatmentClaimsService.getRejectedTreatmentClaims();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'View treatment claim by ID',
    description: 'Retrieve detailed information about a specific treatment claim',
  })
  @ApiParam({
    name: 'id',
    description: 'Treatment claim ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Treatment claim retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Treatment claim retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            type: { type: 'string', example: 'medical' },
            description: { type: 'string', example: 'Annual medical checkup' },
            amount: { type: 'number', example: 50000.00 },
            status: { type: 'string', example: 'pending' },
            serviceDate: { type: 'string', format: 'date' },
            providerReference: { type: 'string', example: 'REF123456' },
            rejectionReason: { type: 'string', example: null },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
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
            plan: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'plan-id' },
                name: { type: 'string', example: 'Premium Health Plan' },
                coverageType: { type: 'string', example: 'Comprehensive' },
                pricingStructure: { type: 'string', example: 'Monthly' },
              },
            },
            hospital: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'hospital-id' },
                name: { type: 'string', example: 'City General Hospital' },
                address: { type: 'string', example: '123 Healthcare Avenue' },
                phone: { type: 'string', example: '+2348012345678' },
                email: { type: 'string', example: 'info@citygeneral.com' },
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
            notes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'note-id' },
                  note: { type: 'string', example: 'Claim under review' },
                  timestamp: { type: 'string', format: 'date-time' },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'user-id' },
                      firstName: { type: 'string', example: 'Admin' },
                      lastName: { type: 'string', example: 'User' },
                    },
                  },
                },
              },
            },
            documents: { type: 'object' },
            metadata: { type: 'object' },
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
    description: 'Treatment claim not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Get', 'Treatment Claim Detail')
  async getTreatmentClaimById(@Param('id') id: string) {
    return await this.treatmentClaimsService.getTreatmentClaimById(id);
  }

  @Post(':id/approve-decline')
  @ApiOperation({
    summary: 'Approve/decline payment refund',
    description: 'Approve or decline a treatment claim with optional reason and amount adjustment',
  })
  @ApiParam({
    name: 'id',
    description: 'Treatment claim ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Treatment claim processed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Treatment claim approved successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            status: { type: 'string', example: 'approved' },
            action: { type: 'string', example: 'approve' },
            reason: { type: 'string', example: 'Claim approved after review of medical documents' },
            approvedAmount: { type: 'number', example: 50000.00 },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Only pending claims can be processed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Treatment claim not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Post', 'Approve Decline Treatment Claim')
  async approveDeclineClaim(
    @Param('id') id: string,
    @Body() payload: ApproveDeclineClaimDto,
  ) {
    return await this.treatmentClaimsService.approveDeclineClaim(id, payload);
  }
}
