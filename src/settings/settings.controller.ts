import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
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
import { SettingsService } from './settings.service';
import { VerifyAccountDto, ResendVerificationDto } from './dto/verify-account.dto';
import { UpdateAccountDetailsDto } from './dto/update-account.dto';
import { UpdatePasswordDto, ForgotPasswordDto, ResetPasswordDto } from './dto/update-password.dto';
import { UploadCredentialsDto, UpdateCredentialDto, DeleteCredentialDto } from './dto/upload-credentials.dto';
import { AdminGuard } from '../utils/guards/admin.guard';
import { AuditInterceptor } from '../audit-log/audit-interceptor.service';
import { AuditLog } from '../utils/decorators/audit-log.decorator';

@ApiTags('Settings')
@ApiBearerAuth('JWT')
@UseGuards(AdminGuard)
@UseInterceptors(AuditInterceptor)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post('verify-account')
  @ApiOperation({
    summary: 'Verify account',
    description: 'Verify user account using email verification code',
  })
  @ApiResponse({
    status: 200,
    description: 'Account verified successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Account verified successfully' },
        data: {
          type: 'object',
          properties: {
            userId: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            email: { type: 'string', example: 'john.doe@example.com' },
            isEmailVerified: { type: 'boolean', example: true },
            verifiedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid verification code or already verified',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Post', 'Verify Account')
  async verifyAccount(@Body() payload: VerifyAccountDto) {
    return await this.settingsService.verifyAccount(payload);
  }

  @Post('resend-verification')
  @ApiOperation({
    summary: 'Resend verification code',
    description: 'Resend email verification code to user',
  })
  @ApiResponse({
    status: 200,
    description: 'Verification code sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Verification code sent successfully' },
        data: {
          type: 'object',
          properties: {
            email: { type: 'string', example: 'john.doe@example.com' },
            expiresIn: { type: 'string', example: '10 minutes' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Account already verified',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Post', 'Resend Verification')
  async resendVerification(@Body() payload: ResendVerificationDto) {
    return await this.settingsService.resendVerification(payload);
  }

  @Put('account/:userId')
  @ApiOperation({
    summary: 'Update account details',
    description: 'Update user account information and profile details',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Account details updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Account details updated successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john.doe@example.com' },
            phoneNumber: { type: 'string', example: '+2348012345678' },
            isEmailVerified: { type: 'boolean', example: true },
            status: { type: 'string', example: 'active' },
            accountStatus: { type: 'string', example: 'active' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Email or phone number already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Put', 'Update Account Details')
  async updateAccountDetails(
    @Param('userId') userId: string,
    @Body() payload: UpdateAccountDetailsDto,
  ) {
    return await this.settingsService.updateAccountDetails(userId, payload);
  }

  @Put('password/:userId')
  @ApiOperation({
    summary: 'Update password',
    description: 'Update user password with current password verification',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Password updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Password updated successfully' },
        data: {
          type: 'object',
          properties: {
            userId: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            email: { type: 'string', example: 'john.doe@example.com' },
            passwordChangedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid current password or password mismatch',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Put', 'Update Password')
  async updatePassword(
    @Param('userId') userId: string,
    @Body() payload: UpdatePasswordDto,
  ) {
    return await this.settingsService.updatePassword(userId, payload);
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Forgot password',
    description: 'Send password reset link to user email',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset link sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'If an account with this email exists, a password reset link has been sent' },
        data: {
          type: 'object',
          properties: {
            email: { type: 'string', example: 'john.doe@example.com' },
            expiresIn: { type: 'string', example: '1 hour' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Post', 'Forgot Password')
  async forgotPassword(@Body() payload: ForgotPasswordDto) {
    return await this.settingsService.forgotPassword(payload);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password',
    description: 'Reset user password using reset token',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Password reset successfully' },
        data: {
          type: 'object',
          properties: {
            userId: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            email: { type: 'string', example: 'john.doe@example.com' },
            passwordResetAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid reset token or password mismatch',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Post', 'Reset Password')
  async resetPassword(@Body() payload: ResetPasswordDto) {
    return await this.settingsService.resetPassword(payload);
  }

  @Post('credentials/:userId')
  @ApiOperation({
    summary: 'Upload credentials',
    description: 'Upload user credentials and documents',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Credentials uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Credentials uploaded successfully' },
        data: {
          type: 'object',
          properties: {
            credentialId: { type: 'string', example: 'credential-id-here' },
            credentialType: { type: 'string', example: 'medical_license' },
            title: { type: 'string', example: 'Medical License - Lagos State' },
            status: { type: 'string', example: 'pending' },
            uploadedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Post', 'Upload Credentials')
  async uploadCredentials(
    @Param('userId') userId: string,
    @Body() payload: UploadCredentialsDto,
  ) {
    return await this.settingsService.uploadCredentials(userId, payload);
  }

  @Get('credentials/:userId')
  @ApiOperation({
    summary: 'Get user credentials',
    description: 'Retrieve all credentials uploaded by user',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'User credentials retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User credentials retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            userId: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            credentials: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'credential-id' },
                  credentialType: { type: 'string', example: 'medical_license' },
                  title: { type: 'string', example: 'Medical License' },
                  status: { type: 'string', example: 'approved' },
                  uploadedAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Get', 'User Credentials')
  async getUserCredentials(@Param('userId') userId: string) {
    return await this.settingsService.getUserCredentials(userId);
  }

  @Put('credentials/:userId')
  @ApiOperation({
    summary: 'Update credential',
    description: 'Update existing user credential information',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Credential updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Credential updated successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'credential-id' },
            userId: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            title: { type: 'string', example: 'Medical License - Updated' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Put', 'Update Credential')
  async updateCredential(
    @Param('userId') userId: string,
    @Body() payload: UpdateCredentialDto,
  ) {
    return await this.settingsService.updateCredential(userId, payload);
  }

  @Delete('credentials/:userId')
  @ApiOperation({
    summary: 'Delete credentials',
    description: 'Delete multiple user credentials',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Credentials deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '2 credential(s) deleted successfully' },
        data: {
          type: 'object',
          properties: {
            userId: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            deletedCredentialIds: {
              type: 'array',
              items: { type: 'string' },
              example: ['credential-id-1', 'credential-id-2'],
            },
            deletedCount: { type: 'number', example: 2 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Delete', 'Delete Credentials')
  async deleteCredentials(
    @Param('userId') userId: string,
    @Body() payload: DeleteCredentialDto,
  ) {
    return await this.settingsService.deleteCredentials(userId, payload);
  }

  @Get('profile/:userId')
  @ApiOperation({
    summary: 'Get user settings',
    description: 'Retrieve complete user profile and settings information',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'User settings retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User settings retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john.doe@example.com' },
            phoneNumber: { type: 'string', example: '+2348012345678' },
            isEmailVerified: { type: 'boolean', example: true },
            status: { type: 'string', example: 'active' },
            accountStatus: { type: 'string', example: 'active' },
            role: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'role-id' },
                name: { type: 'string', example: 'HMO Admin' },
                permission: { type: 'string', example: 'hmo-admin' },
              },
            },
            hmo: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'hmo-id' },
                name: { type: 'string', example: 'Premium HMO' },
                email: { type: 'string', example: 'info@premiumhmo.com' },
              },
            },
            organization: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'org-id' },
                name: { type: 'string', example: 'ABC Company' },
                contactInfo: { type: 'object' },
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
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Get', 'User Settings')
  async getUserSettings(@Param('userId') userId: string) {
    return await this.settingsService.getUserSettings(userId);
  }

  @Get('verification-status/:userId')
  @ApiOperation({
    summary: 'Get user verification status',
    description: 'Retrieve user email verification status',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'User verification status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User verification status retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0' },
            email: { type: 'string', example: 'john.doe@example.com' },
            isEmailVerified: { type: 'boolean', example: true },
            status: { type: 'string', example: 'active' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Get', 'User Verification Status')
  async getUserVerificationStatus(@Param('userId') userId: string) {
    return await this.settingsService.getUserVerificationStatus(userId);
  }

  @Get('activity-stats/:userId')
  @ApiOperation({
    summary: 'Get user activity statistics',
    description: 'Retrieve user activity and usage statistics',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'User activity stats retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User activity stats retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            lastLogin: { type: 'string', format: 'date-time' },
            totalLogins: { type: 'number', example: 150 },
            lastProfileUpdate: { type: 'string', format: 'date-time' },
            totalProfileUpdates: { type: 'number', example: 5 },
            lastPasswordChange: { type: 'string', format: 'date-time' },
            totalPasswordChanges: { type: 'number', example: 3 },
            accountCreated: { type: 'string', format: 'date-time' },
            daysSinceCreation: { type: 'number', example: 45 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Get', 'User Activity Stats')
  async getUserActivityStats(@Param('userId') userId: string) {
    return await this.settingsService.getUserActivityStats(userId);
  }

  @Get('security-settings/:userId')
  @ApiOperation({
    summary: 'Get user security settings',
    description: 'Retrieve user security preferences and settings',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID (UUID)',
    example: 'd3b07384-d9a0-4f5c-a3dd-9b3786cb1df0',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'User security settings retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User security settings retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            twoFactorEnabled: { type: 'boolean', example: false },
            loginNotifications: { type: 'boolean', example: true },
            passwordChangeNotifications: { type: 'boolean', example: true },
            sessionTimeout: { type: 'number', example: 3600 },
            maxLoginAttempts: { type: 'number', example: 5 },
            lockoutDuration: { type: 'number', example: 900 },
            lastPasswordChange: { type: 'string', format: 'date-time' },
            passwordExpiryDays: { type: 'number', example: 90 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @AuditLog('Get', 'User Security Settings')
  async getUserSecuritySettings(@Param('userId') userId: string) {
    return await this.settingsService.getUserSecuritySettings(userId);
  }
}
