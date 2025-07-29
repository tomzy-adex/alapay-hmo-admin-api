import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
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
import { UserService } from './user.service';
import { CreateHmoadminDto } from './dto/create-user.dto';

import { AdminGuard } from '../utils/guards/admin.guard';
import { AuditLog } from '../utils/decorators/audit-log.decorator';
import { AuditInterceptor } from 'src/audit-log/audit-interceptor.service';
import { CreateHmoDto } from 'src/hmo/dto/create-hmo.dto';
import { OnboardAccountDto } from './dto/onboard-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiBearerAuth('JWT')
@ApiTags('User')
@UseInterceptors(AuditInterceptor)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AdminGuard)
  @Get('profile')
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Retrieves the profile information for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @AuditLog('Get', 'User')
  async getAdminById(@Query('adminId') id: string) {
    return await this.userService.getAdminById(id);
  }

  @UseGuards(AdminGuard)
  @Put('profile')
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Updates the profile information for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @AuditLog('Put', 'User')
  async updateAdminProfile(
    @Query('userId') userId: string,
    @Body() payload: UpdateUserDto,
  ) {
    return await this.userService.updateAdminProfile(userId, payload);
  }

  @Post('hmo-admin/:roleId')
  @ApiOperation({
    summary: 'Register HMO admin',
    description: 'Registers a new HMO admin user with the specified role',
  })
  @ApiResponse({
    status: 201,
    description: 'HMO admin registered successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  @AuditLog('Post', 'User')
  async registerHmoAdmin(
    @Param('roleId') roleId: string,
    @Query('token') token: string,
    @Body() payload: CreateHmoadminDto,
  ) {
    return await this.userService.registerHmoAdmin(roleId, token, payload);
  }

  @Post('hmo/:roleId')
  @ApiOperation({
    summary: 'Register HMO',
    description: 'Registers a new HMO with the specified role',
  })
  @ApiResponse({
    status: 201,
    description: 'HMO registered successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  @AuditLog('Post', 'User')
  async registerHmo(
    @Param('roleId') roleId: string,
    @Query('token') token: string,
    @Body() payload: CreateHmoDto,
  ) {
    return await this.userService.registerHmo(roleId, token, payload);
  }

  @Put('verify')
  @ApiOperation({
    summary: 'Verify user account',
    description: 'Verifies a user account using the verification code',
  })
  @ApiResponse({
    status: 200,
    description: 'Account verified successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid verification code',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @AuditLog('Put', 'User')
  async verifyUser(@Query('code') code: string) {
    return await this.userService.verifyUser(code);
  }

  @UseGuards(AdminGuard)
  @Post('onboard')
  @ApiOperation({
    summary: 'Send onboarding link',
    description: 'Sends an onboarding link to a new user',
  })
  @ApiResponse({
    status: 200,
    description: 'Onboarding link sent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @AuditLog('Post', 'User')
  async onboardAccount(@Body() payload: OnboardAccountDto) {
    return await this.userService.onboardAccount(payload);
  }
}
