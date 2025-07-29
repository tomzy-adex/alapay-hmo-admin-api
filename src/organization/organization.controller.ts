import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { AssignPlanDto } from './dto/assign-plan.dto';
import { AdminGuard } from '../utils/guards/admin.guard';
import { AuditLog } from '../utils/decorators/audit-log.decorator';
import { AuditInterceptor } from '../audit-log/audit-interceptor.service';

@ApiBearerAuth('JWT')
@ApiTags('Organization Management')
@UseInterceptors(AuditInterceptor)
@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @UseGuards(AdminGuard)
  @Post()
  @ApiOperation({
    summary: 'Create a new organization',
    description: 'Creates a new organization with the provided details',
  })
  @ApiResponse({
    status: 201,
    description: 'Organization created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @AuditLog('Post', 'Organization')
  async createOrganization(@Body() payload: CreateOrganizationDto) {
    return await this.organizationService.createOrganization(payload);
  }

  @UseGuards(AdminGuard)
  @Post('assign-plan')
  @ApiOperation({
    summary: 'Assign a healthcare plan to an organization',
    description:
      'Assigns a specific healthcare plan to an organization with custom pricing and benefits',
  })
  @ApiResponse({ status: 201, description: 'Plan assigned successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({ status: 404, description: 'Organization or plan not found' })
  @AuditLog('Post', 'Organization Plan')
  async assignPlan(@Body() payload: AssignPlanDto) {
    return await this.organizationService.assignPlan(payload);
  }

  @UseGuards(AdminGuard)
  @Get('hmo/:hmoId')
  @ApiOperation({
    summary: 'Get organizations by HMO',
    description: 'Retrieves all organizations associated with a specific HMO',
  })
  @ApiResponse({
    status: 200,
    description: 'Organizations retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({ status: 404, description: 'HMO not found' })
  @AuditLog('Get', 'Organizations')
  async getOrganizationsByHmo(@Param('hmoId') hmoId: string) {
    return await this.organizationService.getOrganizationsByHmo(hmoId);
  }

  @UseGuards(AdminGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Get organization details',
    description: 'Retrieves detailed information about a specific organization',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization details retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @AuditLog('Get', 'Organization')
  async getOrganizationDetails(@Param('id') id: string) {
    return await this.organizationService.getOrganizationDetails(id);
  }

  @UseGuards(AdminGuard)
  @Get(':id/enrollment-stats')
  @ApiOperation({
    summary: 'Get organization enrollment statistics',
    description: 'Retrieves enrollment statistics for a specific organization',
  })
  @ApiResponse({
    status: 200,
    description: 'Enrollment statistics retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @AuditLog('Get', 'Organization Enrollment')
  async getEnrollmentStats(@Param('id') id: string) {
    return await this.organizationService.getEnrollmentStats(id);
  }

  @UseGuards(AdminGuard)
  @Get('check-expiring-plans')
  @ApiOperation({
    summary: 'Check expiring plans',
    description: 'Checks for organizations with plans that are about to expire',
  })
  @ApiResponse({
    status: 200,
    description: 'Expiring plans checked successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @AuditLog('Get', 'Expiring Plans')
  async checkExpiringPlans(@Query('days') days: number) {
    return await this.organizationService.checkExpiringPlans(days);
  }
}
