import { Controller, UseGuards, UseInterceptors } from '@nestjs/common';
import { Body, Get, Param, Post, Put, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import {
  PaymentOptionDto,
  UpdatePaymentOptionDto,
} from './dto/payment-option.dto';
import { HealthcarePlanQueryDto } from 'src/hmo/dto/hmo-query.dto';
import { QueryDto } from 'src/config/dto/query.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuditInterceptor } from 'src/audit-log/audit-interceptor.service';
import { AdminGuard } from 'src/utils/guards/admin.guard';
import { AuditLog } from 'src/utils/decorators/audit-log.decorator';

@ApiBearerAuth('JWT')
@ApiTags('Payment')
@UseInterceptors(AuditInterceptor)
@UseGuards(AdminGuard)
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('options')
  @ApiOperation({
    summary: 'Create payment options',
    description:
      'Creates payment options for a healthcare plan with specified durations and pricing',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment options created successfully',
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
  @AuditLog('Post', 'Payment')
  async createPaymentOptions(
    @Body() options: PaymentOptionDto[],
    @Query() healthcarePlanQueryDto: HealthcarePlanQueryDto,
  ) {
    return await this.paymentService.createPaymentOptions(
      healthcarePlanQueryDto,
      options,
    );
  }

  @Put('options')
  @ApiOperation({
    summary: 'Update payment options',
    description: 'Updates existing payment options for a healthcare plan',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment options updated successfully',
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
    description: 'Payment option or healthcare plan not found',
  })
  @AuditLog('Put', 'Payment')
  async updatePaymentOptions(
    @Body() options: UpdatePaymentOptionDto[],
    @Query() healthcarePlanQueryDto: HealthcarePlanQueryDto,
  ) {
    return await this.paymentService.updatePaymentOptions(
      healthcarePlanQueryDto,
      options,
    );
  }

  @Get('options')
  @ApiOperation({
    summary: 'Get payment options',
    description: 'Retrieves all payment options for a healthcare plan',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment options retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Healthcare plan not found',
  })
  @AuditLog('Get', 'Payment')
  async getPaymentOptions(
    @Query() healthcarePlanQueryDto: HealthcarePlanQueryDto,
    @Query() query: QueryDto,
  ) {
    return await this.paymentService.getPaymentOptions(
      healthcarePlanQueryDto,
      query,
    );
  }

  @Get(':id/option')
  @ApiOperation({
    summary: 'Get payment option by ID',
    description: 'Retrieves a specific payment option by its ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment option retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment option not found',
  })
  @AuditLog('Get', 'Payment')
  async getPaymentOptionById(
    @Param('id') id: string,
    @Query() healthcarePlanQueryDto: HealthcarePlanQueryDto,
  ) {
    return await this.paymentService.getPaymentOptionById(
      healthcarePlanQueryDto,
      id,
    );
  }

  @Post('notify-outstanding')
  @ApiOperation({
    summary: 'Notify outstanding payments',
    description: 'Sends notifications for outstanding payments to subscribers',
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications sent successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Healthcare plan not found',
  })
  @AuditLog('Post', 'Payment')
  async notifyOutstandingPayments(
    @Query() healthcarePlanQueryDto: HealthcarePlanQueryDto,
  ) {
    return await this.paymentService.notifyOutstandingPayments(
      healthcarePlanQueryDto,
    );
  }
}
