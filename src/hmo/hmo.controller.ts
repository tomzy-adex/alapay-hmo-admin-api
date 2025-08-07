import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Res,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { HmoService } from './hmo.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuditInterceptor } from 'src/audit-log/audit-interceptor.service';
import { AdminGuard } from 'src/utils/guards/admin.guard';
import { AuditLog } from '../utils/decorators/audit-log.decorator';
import { AuthData } from 'src/utils/auth.strategy';
import { GetAuthData } from 'src/utils/decorators/auth.decorator';
import {
  CreateFamilyDiscountsDto,
  CreateHealthcarePlanDto,
} from './dto/create-healthcare-plan.dto';
import { UpdateHealthcarePlanDto } from './dto/update-healthcare-plan.dto';
import { CreateAccountTierDto } from './dto/create-account-tier.dto';
import { UpdateAccountTierDto } from './dto/update-account-tier.dto';
import {
  AccountTierQueryDto,
  HealthcarePlanQueryDto,
  HmoQueryDto,
  HmosQueryDto,
  SimpleHmoQueryDto,
} from './dto/hmo-query.dto';
import { HospitalService } from './hospital.service';
import {
  CreateBulkHospitalDto,
  CreateHospitalDto,
  HospitalQueryDto,
  UpdateHospitalDto,
} from './dto/hospital.dto';
import { Response } from 'express';
import { EnrollmentQueryDto } from './dto/enrollment-query.dto';
import { DownloadFormat } from '../utils/types';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { GetUser } from 'src/utils/get-user.decorator';
import { AccountApprovalDto } from 'src/user/dto/update-user.dto';
import { UpdateHmoDto } from './dto/update-hmo.dto';

@ApiBearerAuth('JWT')
@ApiTags('HMO')
@UseInterceptors(AuditInterceptor)
@UseGuards(AdminGuard)
@Controller('hmo')
export class HmoController {
  constructor(
    private readonly hmoService: HmoService,
    private readonly hospitalService: HospitalService,
  ) {}

  @Put('update-hmo-details')
  @ApiOperation({
    summary: 'Update HMO details',
    description: 'Updates the details of an HMO',
  })
  @ApiResponse({
    status: 200,
    description: 'HMO details updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'HMO not found',
  })
  @AuditLog('Put', 'Hmo')
  async updateHmoDetails(
    @GetAuthData() authData: AuthData,
    @Param() hmoId: string,
    @Body() payload: UpdateHmoDto, // Replace `any` with a proper DTO if available
  ) {
    return await this.hmoService.updateHmoDetails(hmoId, payload, authData);
  }

  @Get('hmo-details')
  @ApiOperation({
    summary: 'Get HMO by ID',
    description: 'Retrieves details of a specific HMO by its ID',
  })
  @ApiResponse({
    status: 200,
    description: 'HMO details retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'HMO not found',
  })
  @AuditLog('Get', 'Hmo')
  async getHmoById(@GetAuthData() authData: AuthData) {
    return await this.hmoService.getHmoById(authData);
  }

  @Put('verify-health-provider-account')
  @ApiOperation({
    summary: 'Verify health provider account',
    description: 'Verifies a health provider account in the HMO network',
  })
  @ApiResponse({
    status: 200,
    description: 'Health provider account verified successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Health provider account not found',
  })
  @AuditLog('Put', 'Hospital')
  async verifyHmoAccount(
    @Query('hospitalId') hospitalId: string,
    @Body() payload: AccountApprovalDto,
  ) {
    return await this.hmoService.verifyHospitalAccount(hospitalId, payload);
  }

  @Post('create-account-tier')
  @ApiOperation({
    summary: 'Create account tier',
    description:
      'Creates a new account tier for an HMO with specified benefits and pricing',
  })
  @ApiResponse({
    status: 201,
    description: 'Account tier created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @AuditLog('Post', 'Hmo')
  async createAccountTier(
    @Query() hmoQuery: HmoQueryDto,
    @GetAuthData() authData: AuthData,
    @Body() payload: CreateAccountTierDto,
  ) {
    return await this.hmoService.createAccountTier(hmoQuery, authData, payload);
  }

  @Put('update-account-tier')
  @ApiOperation({
    summary: 'Update account tier',
    description:
      'Updates an existing account tier with new benefits and pricing',
  })
  @ApiResponse({
    status: 200,
    description: 'Account tier updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Account tier not found',
  })
  @AuditLog('Put', 'Hmo')
  async updateAccountTier(
    @Query() accountTierQueryDto: AccountTierQueryDto,
    @GetAuthData() authData: AuthData,
    @Body() payload: UpdateAccountTierDto,
  ) {
    return await this.hmoService.updateAccountTier(
      accountTierQueryDto,
      authData,
      payload,
    );
  }

  @Get('account-tiers')
  @ApiOperation({
    summary: 'Get account tiers',
    description: 'Retrieves all account tiers for an HMO. Supports both formats: with adminId (for authorized users) or with just hmoId (for public access)',
  })
  @ApiResponse({
    status: 200,
    description: 'Account tiers retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid parameters',
  })
  @AuditLog('Get', 'Hmo')
  async getAccountTiers(
    @Query('hmoId') hmoId: string,
    @Query('adminId') adminId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    if (!hmoId) {
      throw new BadRequestException('hmoId is required');
    }

    if (adminId) {
      // Use the existing method with authorization
      const hmoQuery = { adminId, hmoId, page: page || 1, limit: limit || 10 };
      return await this.hmoService.getAccountTiers(hmoQuery);
    } else {
      // Use the simple method without authorization
      return await this.hmoService.getAccountTiersByHmoId(hmoId);
    }
  }



  @Get('account-tier')
  @ApiOperation({
    summary: 'Get account tier by ID',
    description: 'Retrieves a specific account tier by its ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Account tier retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Account tier not found',
  })
  @AuditLog('Get', 'Hmo')
  async getAccountTierById(@Query() accountTierQueryDto: AccountTierQueryDto) {
    return await this.hmoService.getAccountTierById(accountTierQueryDto);
  }

  @Post('create-healthcare-plan')
  @ApiOperation({
    summary: 'Create healthcare plan',
    description:
      'Creates a new healthcare plan with specified coverage and benefits',
  })
  @ApiResponse({
    status: 201,
    description: 'Healthcare plan created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @AuditLog('Post', 'Hmo')
  async createHealthcarePlan(
    @Query() hmoQuery: HmoQueryDto,
    @GetAuthData() authData: AuthData,
    @Body() payload: CreateHealthcarePlanDto,
  ) {
    return await this.hmoService.createHealthcarePlan(
      hmoQuery,
      authData,
      payload,
    );
  }

  @Put('update-healthcare-plan')
  @ApiOperation({
    summary: 'Update healthcare plan',
    description:
      'Updates an existing healthcare plan with new coverage and benefits',
  })
  @ApiResponse({
    status: 200,
    description: 'Healthcare plan updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Healthcare plan not found',
  })
  @AuditLog('Put', 'Hmo')
  async updateHealthcarePlan(
    healthcarePlanQueryDto: HealthcarePlanQueryDto,
    @GetAuthData() authData: AuthData,
    @Body() payload: UpdateHealthcarePlanDto,
  ) {
    return await this.hmoService.updateHealthcarePlan(
      healthcarePlanQueryDto,
      authData,
      payload,
    );
  }

  @Get('plans')
  @ApiOperation({
    summary: 'Get healthcare plans',
    description: 'Retrieves all healthcare plans for an HMO. Supports both formats: with adminId (for authorized users) or with just hmoId (for public access)',
  })
  @ApiResponse({
    status: 200,
    description: 'Healthcare plans retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid parameters',
  })
  @AuditLog('Get', 'Hmo')
  async getHealthcarePlans(
    @Query('hmoId') hmoId: string,
    @Query('adminId') adminId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    if (!hmoId) {
      throw new BadRequestException('hmoId is required');
    }

    if (adminId) {
      // Use the existing method with authorization
      const hmoQuery = { adminId, hmoId, page: page || 1, limit: limit || 10 };
      return await this.hmoService.getHealthcarePlans(hmoQuery);
    } else {
      // Use the simple method without authorization
      return await this.hmoService.getHealthcarePlansByHmoId(hmoId);
    }
  }

  @Get('plan')
  @ApiOperation({
    summary: 'Get healthcare plan by ID',
    description: 'Retrieves a specific healthcare plan by its ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Healthcare plan retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Healthcare plan not found',
  })
  @AuditLog('Get', 'Hmo')
  async getHealthcarePlanById(
    @Query() healthcarePlanQueryDto: HealthcarePlanQueryDto,
  ) {
    return await this.hmoService.getHealthcarePlanById(healthcarePlanQueryDto);
  }

  @Get('hmo-status')
  @ApiOperation({
    summary: 'Get HMO status',
    description: 'Check the status of an HMO',
  })
  @ApiResponse({
    status: 200,
    description: 'HMO status retrieved successfully',
  })
  @AuditLog('Get', 'Hmo')
  async getHmoStatus(@Query('hmoId') hmoId: string) {
    return await this.hmoService.getHmoStatus(hmoId);
  }

  @Post('set-family-discounts')
  @ApiOperation({
    summary: 'Set family discounts',
    description: 'Sets family discount rates for a healthcare plan',
  })
  @ApiResponse({
    status: 201,
    description: 'Family discounts set successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Healthcare plan not found',
  })
  @AuditLog('Post', 'Hmo')
  async setFamilyDiscounts(
    @Query() healthcarePlanQueryDto: HealthcarePlanQueryDto,
    @Body() familyDiscounts: CreateFamilyDiscountsDto,
  ) {
    return await this.hmoService.setFamilyDiscounts(
      healthcarePlanQueryDto,
      familyDiscounts,
    );
  }

  @Get('family-discounts')
  @ApiOperation({
    summary: 'Get family discounts',
    description: 'Retrieves family discount rates for a healthcare plan',
  })
  @ApiResponse({
    status: 200,
    description: 'Family discounts retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Healthcare plan not found',
  })
  @AuditLog('Get', 'Hmo')
  async getFamilyDiscounts(
    @Query() healthcarePlanQueryDto: HealthcarePlanQueryDto,
  ) {
    return await this.hmoService.getFamilyDiscounts(healthcarePlanQueryDto);
  }

  @Post('add-hospital')
  @ApiOperation({
    summary: 'Add hospital',
    description: 'Adds a new hospital to an HMO network',
  })
  @ApiResponse({
    status: 201,
    description: 'Hospital added successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @AuditLog('Post', 'Hospital')
  async addHospital(
    @Query() hmoQuery: HmoQueryDto,
    @Body() createHospitalDto: CreateHospitalDto,
  ) {
    return await this.hospitalService.addHospital(hmoQuery, createHospitalDto);
  }

  @Post('bulk-upload-hospitals-csv')
  @ApiOperation({
    summary: 'Bulk upload hospitals via CSV',
    description:
      'Uploads multiple hospitals to an HMO network using a CSV file',
  })
  @ApiResponse({
    status: 201,
    description: 'Hospitals uploaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid file format or data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  )
  @AuditLog('Post', 'Hospital')
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query() hmoQuery: HmosQueryDto,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return await this.hospitalService.bulkUploadCSV(file, hmoQuery);
  }

  @Post('bulk-upload-hospitals-json')
  @ApiOperation({
    summary: 'Bulk upload hospitals via JSON',
    description: 'Uploads multiple hospitals to an HMO network using JSON data',
  })
  @ApiResponse({
    status: 201,
    description: 'Hospitals uploaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @AuditLog('Post', 'Hospital')
  async bulkUploadJSON(
    @Body() hospitalsData: CreateBulkHospitalDto[],
    @Query() hmoQuery: HmosQueryDto,
  ) {
    return await this.hospitalService.bulkUploadJSON(hospitalsData, hmoQuery);
  }

  @Put('update-hospital')
  @ApiOperation({
    summary: 'Update hospital',
    description: 'Updates an existing hospital information in the HMO network',
  })
  @ApiResponse({
    status: 200,
    description: 'Hospital updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Hospital not found',
  })
  @AuditLog('Put', 'Hospital')
  async updateHospital(
    @Query() hmoQuery: HospitalQueryDto,
    @Body() updateHospitalDto: UpdateHospitalDto,
  ) {
    return await this.hospitalService.updateHospital(
      hmoQuery,
      updateHospitalDto,
    );
  }

  @Post('add-plans-to-hospital')
  @ApiOperation({
    summary: 'Add plans to hospital',
    description: 'Assigns healthcare plans to a hospital in the HMO network',
  })
  @ApiResponse({
    status: 201,
    description: 'Plans assigned successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Hospital or plan not found',
  })
  @AuditLog('Post', 'Hospital')
  async addPlansToHospital(
    @Query() hmoQuery: HospitalQueryDto,
    @Body() planIds: string[],
  ) {
    return await this.hospitalService.addPlansToHospital(hmoQuery, planIds);
  }

  @Get('hospitals')
  @ApiOperation({
    summary: 'Get all hospitals',
    description: 'Retrieves all hospitals in an HMO network',
  })
  @ApiResponse({
    status: 200,
    description: 'Hospitals retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @AuditLog('Get', 'Hospital')
  async getAllHospitals(@Query() hmoQuery: HmosQueryDto) {
    return await this.hospitalService.getAllHospitals(hmoQuery);
  }

  @Get('hospital')
  @ApiOperation({
    summary: 'Get hospital by ID',
    description: 'Retrieves a specific hospital by its ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Hospital retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Hospital not found',
  })
  @AuditLog('Get', 'Hospital')
  async getHospitalById(@Query() hmoQuery: HospitalQueryDto) {
    return await this.hospitalService.getHospitalById(hmoQuery);
  }

  @Delete('delist-hospital')
  @ApiOperation({
    summary: 'Delist hospital',
    description: 'Removes a hospital from the HMO network',
  })
  @ApiResponse({
    status: 200,
    description: 'Hospital delisted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Hospital not found',
  })
  @AuditLog('Delete', 'Hospital')
  async deleteHospital(
    @Query() hmoQuery: HospitalQueryDto,
    @Body() reason: string,
  ) {
    return await this.hospitalService.delistHospital(hmoQuery, reason);
  }

  @Delete('delete-plan-from-hospital')
  @ApiOperation({
    summary: 'Delete plan from hospital',
    description: 'Removes a healthcare plan from a hospital',
  })
  @ApiResponse({
    status: 200,
    description: 'Plan removed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Hospital or plan not found',
  })
  @AuditLog('Delete', 'Hospital')
  async deletePlanFromHospital(
    @Query() hmoQuery: HospitalQueryDto,
    @Query('planId') planId: string,
  ) {
    return await this.hospitalService.deletePlanFromHospital(hmoQuery, planId);
  }

  @Get('enrollments')
  @ApiOperation({
    summary: 'Get enrollments',
    description: 'Retrieves all enrollments for an HMO with optional filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Enrollments retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @AuditLog('Get', 'Enrollment')
  async getEnrollments(
    @Query() hmoQuery: HmosQueryDto,
    @Query() query: EnrollmentQueryDto,
  ) {
    return await this.hmoService.getEnrollments(hmoQuery, query);
  }

  @Get('download-enrollments')
  @ApiOperation({
    summary: 'Download enrollments',
    description:
      'Downloads enrollment data in the specified format (PDF, XLSX, or CSV)',
  })
  @ApiResponse({
    status: 200,
    description: 'Enrollment data downloaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid format specified',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @AuditLog('Get', 'Enrollment')
  async downloadEnrollments(
    @Query() hmoQuery: HmosQueryDto,
    @Query() query: EnrollmentQueryDto,
    @Query('format') format: DownloadFormat,
    @Res() res: Response,
  ) {
    const result = await this.hmoService.downloadEnrollments(
      hmoQuery,
      query,
      format,
    );

    res.setHeader(
      'Content-Type',
      format === DownloadFormat.XLSX
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${result.filename}`,
    );

    return res.send(result.data);
  }

  @Get('dashboard/metrics')
  @ApiOperation({
    summary: 'Get dashboard metrics',
    description: 'Retrieves key performance metrics for the HMO dashboard',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard metrics retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @AuditLog('Get', 'Dashboard')
  async getDashboardMetrics(
    @GetUser() user: AuthData,
    @Query() query: DashboardQueryDto,
  ) {
    const hmoQuery: HmosQueryDto = {
      hmoId: user.hmoId,
      adminId: user.id,
      limit: query.limit || 10,
      page: query.page || 1,
    };
    return await this.hmoService.getDashboardMetrics(hmoQuery, query);
  }

  @Get('dashboard/transaction-history')
  @ApiOperation({
    summary: 'Get transaction history',
    description: 'Retrieves transaction history for the HMO dashboard',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction history retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @AuditLog('Get', 'Dashboard')
  async getTransactionHistory(
    @GetUser() user: AuthData,
    @Query() query: DashboardQueryDto,
  ) {
    const hmoQuery: HmosQueryDto = {
      hmoId: user.hmoId,
      adminId: user.id,
      limit: query.limit || 10,
      page: query.page || 1,
    };
    return await this.hmoService.getTransactionHistory(hmoQuery, query);
  }

  @Get('dashboard/service-analytics')
  @ApiOperation({
    summary: 'Get service analytics',
    description: 'Retrieves service usage analytics for the HMO dashboard',
  })
  @ApiResponse({
    status: 200,
    description: 'Service analytics retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @AuditLog('Get', 'Dashboard')
  async getServiceAnalytics(
    @GetUser() user: AuthData,
    @Query() query: DashboardQueryDto,
  ) {
    const hmoQuery: HmosQueryDto = {
      hmoId: user.hmoId,
      adminId: user.id,
      limit: query.limit || 10,
      page: query.page || 1,
    };
    return await this.hmoService.getServiceAnalytics(hmoQuery, query);
  }

  @Get('dashboard/payment-analytics')
  @ApiOperation({
    summary: 'Get payment analytics',
    description: 'Retrieves payment analytics for the HMO dashboard',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment analytics retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @AuditLog('Get', 'Dashboard')
  async getPaymentAnalytics(
    @GetUser() user: AuthData,
    @Query() query: DashboardQueryDto,
  ) {
    const hmoQuery: HmosQueryDto = {
      hmoId: user.hmoId,
      adminId: user.id,
      limit: query.limit || 10,
      page: query.page || 1,
    };
    return await this.hmoService.getPaymentAnalytics(hmoQuery, query);
  }
}
